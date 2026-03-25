import csv
from io import StringIO

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from db import db
from dtos import ItemCreate, ItemUpdate

router = APIRouter(prefix="/items", tags=["items"])


class QuantityChangeRequest(BaseModel):
    change: int


class TransferItemRequest(BaseModel):
    targetCrateId: int

@router.get("/")
async def get_items(lowStock: bool = False):
    items = await db.item.find_many(include={'crate': {'include': {'cabinet': True}}})
    if lowStock:
        return [item for item in items if item.quantity < item.minQuantity]
    return items


@router.get("/search")
async def search_items(q: str):
    items = await db.item.find_many(
        where={
            'name': {
                'contains': q,
                'mode': 'insensitive'
            }
        },
        include={'crate': {'include': {'cabinet': True}}}
    )
    return items


@router.get("/stats")
async def get_item_stats():
    items = await db.item.find_many(include={'category': True, 'crate': {'include': {'category': True}}})

    total_items = len(items)
    total_quantity = sum(item.quantity for item in items)
    low_stock_items = sum(1 for item in items if item.quantity < item.minQuantity)

    per_category = {}
    for item in items:
        category_name = None
        if item.category and item.category.name:
            category_name = item.category.name
        elif item.crate and item.crate.category and item.crate.category.name:
            category_name = item.crate.category.name

        if category_name:
            per_category[category_name] = per_category.get(category_name, 0) + 1

    categories = [
        {'name': name, 'count': count}
        for name, count in sorted(per_category.items(), key=lambda x: x[0].lower())
    ]

    return {
        'totalItems': total_items,
        'lowStockItems': low_stock_items,
        'totalQuantity': total_quantity,
        'categories': categories
    }


@router.get("/export/shopping-list")
async def export_shopping_list():
    all_items = await db.item.find_many(include={'crate': {'include': {'cabinet': True}}})

    filtered_items = [item for item in all_items if item.quantity < item.minQuantity]

    csv_buffer = StringIO()
    writer = csv.writer(csv_buffer)
    writer.writerow(['Item', 'Current Quantity', 'Min Quantity', 'Missing', 'Cabinet', 'Crate'])

    for item in filtered_items:
        missing = item.minQuantity - item.quantity
        cabinet_number = item.crate.cabinet.number if item.crate and item.crate.cabinet else ''
        crate_number = item.crate.number if item.crate else ''
        writer.writerow([
            item.name,
            item.quantity,
            item.minQuantity,
            missing,
            cabinet_number,
            crate_number
        ])

    return Response(
        content=csv_buffer.getvalue(),
        media_type='text/csv',
        headers={
            'Content-Disposition': 'attachment; filename=shopping-list.csv'
        }
    )

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
    crate = await db.crate.find_unique(where={'id': item.crateId})
    if not crate:
        raise HTTPException(status_code=404, detail="Crate not found")

    if item.categoryId is not None:
        category = await db.category.find_unique(where={'id': item.categoryId})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

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

    existing_item = await db.item.find_unique(where={'id': id})
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    if 'crateId' in update_data:
        crate = await db.crate.find_unique(where={'id': update_data['crateId']})
        if not crate:
            raise HTTPException(status_code=404, detail="Crate not found")

    if 'categoryId' in update_data and update_data['categoryId'] is not None:
        category = await db.category.find_unique(where={'id': update_data['categoryId']})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    return await db.item.update(
        where={'id': id},
        data=update_data
    )


@router.patch("/{id}/quantity")
async def update_item_quantity(id: int, payload: QuantityChangeRequest):
    item = await db.item.find_unique(where={'id': id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    new_quantity = item.quantity + payload.change
    if new_quantity < 0:
        raise HTTPException(status_code=400, detail="Quantity cannot be negative")

    return await db.item.update(
        where={'id': id},
        data={'quantity': new_quantity}
    )


@router.post("/{id}/transfer")
async def transfer_item(id: int, payload: TransferItemRequest):
    item = await db.item.find_unique(where={'id': id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    target_crate = await db.crate.find_unique(where={'id': payload.targetCrateId})
    if not target_crate:
        raise HTTPException(status_code=404, detail="Target crate not found")

    return await db.item.update(
        where={'id': id},
        data={'crateId': payload.targetCrateId},
        include={'crate': {'include': {'cabinet': True}}}
    )

@router.delete("/{id}")
async def delete_item(id: int):
    try:
        return await db.item.delete(where={'id': id})
    except Exception:
        raise HTTPException(status_code=404, detail="Item not found")
