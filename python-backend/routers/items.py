from fastapi import APIRouter, HTTPException
from db import db
from dtos import ItemCreate, ItemUpdate

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/")
async def get_items():
    return await db.item.find_many(include={'crate': True})

@router.get("/{id}")
async def get_item(id: int):
    item = await db.item.find_unique(
        where={'id': id},
        include={'crate': {'include': {'cabinet': True}}}
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/")
async def create_item(item: ItemCreate):
    return await db.item.create(
        data={
            'name': item.name,
            'crateId': item.crateId,
            'categoryId': item.categoryId,
            'quantity': item.quantity,
            'minQuantity': item.minQuantity,
            'photoUrl': item.photoUrl,
            'status': item.status,
            'lentTo': item.lentTo
        }
    )

@router.patch("/{id}")
async def update_item(id: int, item: ItemUpdate):
    # Filter out None values to only update what's payload
    update_data = {k: v for k, v in item.model_dump().items() if v is not None}
    
    if not update_data:
         raise HTTPException(status_code=400, detail="No data provided for update")

    try:
        return await db.item.update(
            where={'id': id},
            data=update_data
        )
    except Exception as e:
         raise HTTPException(status_code=404, detail="Item not found")

@router.delete("/{id}")
async def delete_item(id: int):
    try:
        return await db.item.delete(where={'id': id})
    except Exception:
        raise HTTPException(status_code=404, detail="Item not found")
