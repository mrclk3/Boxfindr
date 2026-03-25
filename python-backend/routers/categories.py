from fastapi import APIRouter, HTTPException, Request
from db import db
from dtos import CategoryCreate, CategoryUpdate
from audit import log_action

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/")
async def get_categories():
    return await db.category.find_many()

@router.get("/{id}")
async def get_category(id: int):
    category = await db.category.find_unique(where={'id': id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/")
async def create_category(category: CategoryCreate, request: Request):
    existing = await db.category.find_unique(where={'name': category.name})
    if existing:
        raise HTTPException(status_code=409, detail="Category with this name already exists")
    
    created = await db.category.create(
        data={'name': category.name}
    )
    await log_action(request, "CREATE", f"Created category {created.name}")
    return created

@router.patch("/{id}")
async def update_category(id: int, category: CategoryUpdate, request: Request):
    existing = await db.category.find_unique(where={'id': id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = {k: v for k, v in category.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    updated = await db.category.update(
        where={'id': id},
        data=update_data
    )
    await log_action(request, "UPDATE", f"Updated category {updated.name}")
    return updated

@router.delete("/{id}")
async def delete_category(id: int, request: Request):
    category = await db.category.find_unique(where={'id': id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    deleted = await db.category.delete(where={'id': id})
    await log_action(request, "DELETE", f"Deleted category {deleted.name}")
    return deleted
