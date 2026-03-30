import base64
import io
import os
from typing import Any

import qrcode

from db import db


def _get_public_base_url() -> str:
    base_url = (
        os.getenv("QR_PUBLIC_BASE_URL")
        or os.getenv("PUBLIC_BASE_URL")
        or ""
    ).strip()
    if not base_url:
        return ""
    return base_url.rstrip("/")


def build_qr_payload(entity: str, entity_id: int) -> str:
    base = entity.strip().lower()
    if base.endswith("s"):
        base = base[:-1]

    public_base_url = _get_public_base_url()

    if base == "cabinet":
        path = f"/cabinets/{entity_id}"
        return f"{public_base_url}{path}" if public_base_url else path
    if base == "crate":
        path = f"/crates/{entity_id}"
        return f"{public_base_url}{path}" if public_base_url else path
    if base == "item":
        path = f"/scan?itemId={entity_id}"
        return f"{public_base_url}{path}" if public_base_url else path

    raise ValueError(f"Unsupported entity type: {entity}")


def generate_qr_data_url(payload: str) -> str:
    image = qrcode.make(payload)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def _to_plain(data: Any) -> Any:
    if data is None:
        return None
    if hasattr(data, "model_dump"):
        return data.model_dump()
    if isinstance(data, list):
        return [_to_plain(item) for item in data]
    if isinstance(data, dict):
        return {k: _to_plain(v) for k, v in data.items()}
    return data


def strip_qr_fields(data: Any) -> Any:
    plain = _to_plain(data)

    if isinstance(plain, list):
        return [strip_qr_fields(item) for item in plain]

    if isinstance(plain, dict):
        return {
            key: strip_qr_fields(value)
            for key, value in plain.items()
            if key not in {"qrCode", "qrImageData"}
        }

    return plain


async def ensure_all_qr_assets() -> None:
    cabinets = await db.cabinet.find_many()
    for cabinet in cabinets:
        payload = build_qr_payload("cabinet", cabinet.id)
        image = generate_qr_data_url(payload)
        if cabinet.qrCode != payload or getattr(cabinet, "qrImageData", None) != image:
            await db.cabinet.update(
                where={"id": cabinet.id},
                data={"qrCode": payload, "qrImageData": image},
            )

    crates = await db.crate.find_many()
    for crate in crates:
        payload = build_qr_payload("crate", crate.id)
        image = generate_qr_data_url(payload)
        if crate.qrCode != payload or getattr(crate, "qrImageData", None) != image:
            await db.crate.update(
                where={"id": crate.id},
                data={"qrCode": payload, "qrImageData": image},
            )

    items = await db.item.find_many()
    for item in items:
        payload = build_qr_payload("item", item.id)
        image = generate_qr_data_url(payload)
        if getattr(item, "qrCode", None) != payload or getattr(item, "qrImageData", None) != image:
            await db.item.update(
                where={"id": item.id},
                data={"qrCode": payload, "qrImageData": image},
            )
