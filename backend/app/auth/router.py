from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    LogoutRequest,
    OkResponse,
    RefreshRequest,
    RefreshResponse,
    TokenResponse,
    UserOut,
)
from app.auth.service import change_password, login, logout, refresh, user_to_out
from app.core.database import get_session
from app.models import User

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login_route(payload: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    access_token, refresh_token, expires_in, user = await login(
        session, payload.email, payload.password
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=user_to_out(user),
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_route(
    payload: RefreshRequest, session: AsyncSession = Depends(get_session)
) -> RefreshResponse:
    access_token, refresh_token, expires_in = await refresh(session, payload.refresh_token)
    return RefreshResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


@router.post("/logout", response_model=OkResponse)
async def logout_route(
    payload: LogoutRequest, session: AsyncSession = Depends(get_session)
) -> OkResponse:
    await logout(session, payload.refresh_token)
    return OkResponse(ok=True)


@router.get("/me", response_model=UserOut)
async def me_route(user: User = Depends(get_current_user)) -> UserOut:
    return user_to_out(user)


@router.post("/change-password", response_model=OkResponse)
async def change_password_route(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> OkResponse:
    await change_password(session, user, payload.current_password, payload.new_password)
    return OkResponse(ok=True)

