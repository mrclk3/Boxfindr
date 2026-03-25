from fastapi import APIRouter, HTTPException, Request
from db import db
from dtos import CrateCreate
from audit import log_action

router = APIRouter(prefix="/crates", tags=["crates"])

@router.get("/")
async def get_crates():
    return await db.crate.find_many(include={'items': True, 'cabinet': True})

@router.get("/by-qr/{qr_code}")
async def get_crate_by_qr(qr_code: str):
    crate = await db.crate.find_unique(
        where={'qrCode': qr_code},
        include={'items': True, 'cabinet': True}
    )
    if not crate:
        raise HTTPException(status_code=404, detail="Crate not found")
    return crate

@router.get("/{id}")
async def get_crate(id: int):
    crate = await db.crate.find_unique(
        where={'id': id},
        include={'items': True, 'cabinet': True}
    )
    if not crate:
        raise HTTPException(status_code=404, detail="Crate not found")
    return crate

@router.post("/")
async def create_crate(crate: CrateCreate, request: Request):
    # Check for duplicate QR code
    existing = await db.crate.find_unique(where={'qrCode': crate.qrCode})
    if existing:
        raise HTTPException(status_code=409, detail="Crate with this QR code already exists")

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
            'qrCode': crate.qrCode
        }
    )
    await log_action(request, "CREATE", f"Created crate {created.number}")
    return created

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
