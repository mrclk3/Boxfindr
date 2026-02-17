from fastapi import APIRouter, HTTPException, Depends
from typing import List
from db import db
from dtos import CabinetCreate, CabinetUpdate

router = APIRouter(prefix="/cabinets", tags=["cabinets"])

@router.get("/")
async def get_cabinets():
    return await db.cabinet.find_many(include={'crates': True})

@router.get("/{id}")
async def get_cabinet(id: int):
    cabinet = await db.cabinet.find_unique(
        where={'id': id},
        include={'crates': {'include': {'items': True}}}
    )
    if not cabinet:
        raise HTTPException(status_code=404, detail="Cabinet not found")
    return cabinet

@router.post("/")
async def create_cabinet(cabinet: CabinetCreate):
    # Check for duplicate number or QR code
    existing = await db.cabinet.find_first(
        where={
            'OR': [
                {'number': cabinet.number},
                {'qrCode': cabinet.qrCode}
            ]
        }
    )
    if existing:
        raise HTTPException(status_code=409, detail="Cabinet with this number or QR code already exists")
    
    return await db.cabinet.create(
        data={
            'number': cabinet.number,
            'location': cabinet.location,
            'qrCode': cabinet.qrCode
        }
    )

@router.delete("/{id}")
async def delete_cabinet(id: int):
    # Check if cabinet exists and has crates
    cabinet = await db.cabinet.find_unique(
        where={'id': id},
        include={'crates': True}
    )
    if not cabinet:
        raise HTTPException(status_code=404, detail="Cabinet not found")
    
    if cabinet.crates and len(cabinet.crates) > 0:
        raise HTTPException(status_code=400, detail="Cannot delete cabinet that contains crates")
    
    return await db.cabinet.delete(where={'id': id})
