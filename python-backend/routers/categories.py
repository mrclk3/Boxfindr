from fastapi import APIRouter, HTTPException
from db import db
from dtos import CategoryCreate, CategoryUpdate

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
async def create_category(category: CategoryCreate):
    existing = await db.category.find_unique(where={'name': category.name})
    if existing:
        raise HTTPException(status_code=409, detail="Category with this name already exists")
    
    return await db.category.create(
        data={'name': category.name}
    )

@router.patch("/{id}")
async def update_category(id: int, category: CategoryUpdate):
    existing = await db.category.find_unique(where={'id': id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = {k: v for k, v in category.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    return await db.category.update(
        where={'id': id},
        data=update_data
    )

@router.delete("/{id}")
async def delete_category(id: int):
    category = await db.category.find_unique(where={'id': id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return await db.category.delete(where={'id': id})
