from fastapi import APIRouter, HTTPException, Request
from db import db
from dtos import CrateCreate
from audit import log_action
from qr_utils import build_qr_payload, generate_qr_data_url, strip_qr_fields
from security import is_admin_request

router = APIRouter(prefix="/crates", tags=["crates"])

@router.get("/")
async def get_crates(request: Request):
    crates = await db.crate.find_many(include={'items': True, 'cabinet': True})
    if await is_admin_request(request):
        return crates
    return strip_qr_fields(crates)

@router.get("/by-qr/{qr_code:path}")
async def get_crate_by_qr(qr_code: str, request: Request):
    crate = await db.crate.find_unique(
        where={'qrCode': qr_code},
        include={'items': True, 'cabinet': True}
    )
    if not crate:
        raise HTTPException(status_code=404, detail="Crate not found")
    if await is_admin_request(request):
        return crate
    return strip_qr_fields(crate)

@router.get("/{id}")
async def get_crate(id: int, request: Request):
    crate = await db.crate.find_unique(
        where={'id': id},
        include={'items': True, 'cabinet': True}
    )
    if not crate:
        raise HTTPException(status_code=404, detail="Crate not found")
    if await is_admin_request(request):
        return crate
    return strip_qr_fields(crate)

@router.post("/")
async def create_crate(crate: CrateCreate, request: Request):
    # Check for duplicate number in same cabinet
    existing_in_cabinet = await db.crate.find_first(
        where={'cabinetId': crate.cabinetId, 'number': crate.number}
    )
    if existing_in_cabinet:
        raise HTTPException(status_code=409, detail="Crate number already exists in this cabinet")

    created = await db.crate.create(
        data={
            'number': crate.number,
            'cabinetId': crate.cabinetId,
            'categoryId': crate.categoryId,
        }
    )

    qr_payload = build_qr_payload('crate', created.id)
    qr_image = generate_qr_data_url(qr_payload)
    created = await db.crate.update(
        where={'id': created.id},
        data={
            'qrCode': qr_payload,
            'qrImageData': qr_image,
        }
    )

    await log_action(request, "CREATE", f"Created crate {created.number}")
    if await is_admin_request(request):
        return created
    return strip_qr_fields(created)

@router.delete("/{id}")
async def delete_crate(id: int, request: Request):
    crate = await db.crate.find_unique(
        where={'id': id},
        include={'items': True}
    )
    if not crate:
        raise HTTPException(status_code=404, detail="Crate not found")
    
    if crate.items and len(crate.items) > 0:
        raise HTTPException(status_code=400, detail="Cannot delete crate that contains items")
    
    deleted = await db.crate.delete(where={'id': id})
    await log_action(request, "DELETE", f"Deleted crate {deleted.number}")
    return deleted
