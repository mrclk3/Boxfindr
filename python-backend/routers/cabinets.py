from fastapi import APIRouter, HTTPException, Request
from typing import List
from db import db
from dtos import CabinetCreate, CabinetUpdate
from audit import log_action
from qr_utils import build_qr_payload, generate_qr_data_url, strip_qr_fields
from security import is_admin_request

router = APIRouter(prefix="/cabinets", tags=["cabinets"])

@router.get("/")
async def get_cabinets(request: Request):
    cabinets = await db.cabinet.find_many(include={'crates': True})
    if await is_admin_request(request):
        return cabinets
    return strip_qr_fields(cabinets)

@router.get("/by-qr/{qr_code:path}")
async def get_cabinet_by_qr(qr_code: str, request: Request):
    cabinet = await db.cabinet.find_unique(
        where={'qrCode': qr_code},
        include={'crates': True}
    )
    if not cabinet:
        raise HTTPException(status_code=404, detail="Cabinet not found")
    if await is_admin_request(request):
        return cabinet
    return strip_qr_fields(cabinet)

@router.get("/{id}")
async def get_cabinet(id: int, request: Request):
    cabinet = await db.cabinet.find_unique(
        where={'id': id},
        include={'crates': {'include': {'items': True}}}
    )
    if not cabinet:
        raise HTTPException(status_code=404, detail="Cabinet not found")
    if await is_admin_request(request):
        return cabinet
    return strip_qr_fields(cabinet)

@router.post("/")
async def create_cabinet(cabinet: CabinetCreate, request: Request):
    # Check for duplicate number
    existing = await db.cabinet.find_first(
        where={
            'number': cabinet.number,
        }
    )
    if existing:
        raise HTTPException(status_code=409, detail="Cabinet with this number already exists")

    created = await db.cabinet.create(
        data={
            'number': cabinet.number,
            'location': cabinet.location,
        }
    )

    qr_payload = build_qr_payload('cabinet', created.id)
    qr_image = generate_qr_data_url(qr_payload)
    created = await db.cabinet.update(
        where={'id': created.id},
        data={
            'qrCode': qr_payload,
            'qrImageData': qr_image,
        }
    )

    await log_action(request, "CREATE", f"Created cabinet {created.number}")
    if await is_admin_request(request):
        return created
    return strip_qr_fields(created)

@router.delete("/{id}")
async def delete_cabinet(id: int, request: Request):
    # Check if cabinet exists and has crates
    cabinet = await db.cabinet.find_unique(
        where={'id': id},
        include={'crates': True}
    )
    if not cabinet:
        raise HTTPException(status_code=404, detail="Cabinet not found")
    
    if cabinet.crates and len(cabinet.crates) > 0:
        raise HTTPException(status_code=400, detail="Cannot delete cabinet that contains crates")
    
    deleted = await db.cabinet.delete(where={'id': id})
    await log_action(request, "DELETE", f"Deleted cabinet {deleted.number}")
    return deleted
