from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class ItemStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    LENT = "LENT"

# Cabinet DTOs
class CabinetCreate(BaseModel):
    number: str
    location: Optional[str] = None
    qrCode: str

class CabinetUpdate(BaseModel):
    location: Optional[str] = None

# Crate DTOs
class CrateCreate(BaseModel):
    number: str
    cabinetId: int
    categoryId: Optional[int] = None
    qrCode: str

# Item DTOs
class ItemCreate(BaseModel):
    name: str
    crateId: int
    categoryId: Optional[int] = None
    quantity: int = 0
    minQuantity: int = 0
    photoUrl: Optional[str] = None
    status: ItemStatus = ItemStatus.AVAILABLE
    lentTo: Optional[str] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    categoryId: Optional[int] = None
    quantity: Optional[int] = None
    minQuantity: Optional[int] = None
    photoUrl: Optional[str] = None
    status: Optional[ItemStatus] = None
    lentTo: Optional[str] = None
    crateId: Optional[int] = None
