"""
Document upload and management endpoints.
"""
import os
import uuid
import mimetypes
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
from asgiref.sync import sync_to_async

# Django imports
from apps.users.documents import Document
from apps.users.models import User, Person
from apps.insurance.models import InsuranceRegistration
from core.dependencies import get_current_user
from django.conf import settings
from django.core.files.base import ContentFile


router = APIRouter()


# Pydantic models
class DocumentResponse(BaseModel):
    id: str
    document_type: str
    title: str
    description: Optional[str]
    file_name: str
    file_size: int
    file_size_mb: float
    mime_type: Optional[str]
    is_verified: bool
    created_at: datetime
    registration_id: Optional[str]
    person_id: Optional[str]
    
    class Config:
        from_attributes = True


class DocumentWithUserResponse(BaseModel):
    id: str
    document_type: str
    title: str
    description: Optional[str]
    file_name: str
    file_size: int
    file_size_mb: float
    mime_type: Optional[str]
    is_verified: bool
    created_at: datetime
    registration_id: Optional[str]
    person_id: Optional[str]
    user_id: str
    user_name: str
    user_email: str
    
    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


class DocumentWithUserListResponse(BaseModel):
    documents: List[DocumentWithUserResponse]
    total: int


# Allowed file extensions and max size
ALLOWED_EXTENSIONS = {
    'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'zip', 'rar'
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file."""
    # Check file extension
    file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"فرمت فایل مجاز نیست. فرمت‌های مجاز: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"حجم فایل بیش از حد مجاز است. حداکثر: {MAX_FILE_SIZE / (1024*1024)}MB"
        )


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    registration_id: Optional[str] = Form(None),
    person_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a document.
    
    - **file**: The file to upload
    - **document_type**: Type of document (national_id, birth_certificate, etc.)
    - **title**: Document title
    - **description**: Optional description
    - **registration_id**: Optional insurance registration ID
    - **person_id**: Optional person ID
    """
    # Validate file
    validate_file(file)
    
    # Validate document type
    valid_types = [choice[0] for choice in Document.DOCUMENT_TYPE_CHOICES]
    if document_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"نوع مدرک نامعتبر است. انواع مجاز: {', '.join(valid_types)}"
        )
    
    # Validate registration if provided
    registration = None
    if registration_id:
        try:
            registration = await sync_to_async(InsuranceRegistration.objects.get)(id=registration_id, user=current_user)
        except InsuranceRegistration.DoesNotExist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ثبت‌نام یافت نشد"
            )
    
    # Validate person if provided
    person = None
    if person_id:
        try:
            person = await sync_to_async(Person.objects.get)(id=person_id, user=current_user)
        except Person.DoesNotExist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="شخص یافت نشد"
            )
    
    # Read file content
    file_content = await file.read()
    file_size = len(file_content)
    
    # Detect MIME type
    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0]
    
    # Create and save document using sync_to_async
    def save_document():
        document = Document(
            user=current_user,
            document_type=document_type,
            title=title,
            description=description,
            file_name=file.filename,
            file_size=file_size,
            mime_type=mime_type,
            registration=registration,
            person=person
        )
        document.file.save(file.filename, ContentFile(file_content), save=True)
        return document
    
    document = await sync_to_async(save_document)()
    
    return DocumentResponse(
        id=str(document.id),
        document_type=document.document_type,
        title=document.title,
        description=document.description,
        file_name=document.file_name,
        file_size=document.file_size,
        file_size_mb=document.get_file_size_mb(),
        mime_type=document.mime_type,
        is_verified=document.is_verified,
        created_at=document.created_at,
        registration_id=str(registration.id) if registration else None,
        person_id=str(person.id) if person else None
    )


@router.get("/", response_model=DocumentListResponse)
async def get_user_documents(
    document_type: Optional[str] = None,
    registration_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get all documents for the current user.
    
    - **document_type**: Optional filter by document type
    - **registration_id**: Optional filter by registration
    """
    def get_documents():
        documents = Document.objects.filter(user=current_user)
        
        if document_type:
            documents = documents.filter(document_type=document_type)
        
        if registration_id:
            documents = documents.filter(registration_id=registration_id)
        
        documents = documents.order_by('-created_at')
        
        document_list = [
            DocumentResponse(
                id=str(doc.id),
                document_type=doc.document_type,
                title=doc.title,
                description=doc.description,
                file_name=doc.file_name,
                file_size=doc.file_size,
                file_size_mb=doc.get_file_size_mb(),
                mime_type=doc.mime_type,
                is_verified=doc.is_verified,
                created_at=doc.created_at,
                registration_id=str(doc.registration.id) if doc.registration else None,
                person_id=str(doc.person.id) if doc.person else None
            )
            for doc in documents
        ]
        
        return DocumentListResponse(
            documents=document_list,
            total=len(document_list)
        )
    
    return await sync_to_async(get_documents)()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific document by ID."""
    def get_doc():
        try:
            return Document.objects.get(id=document_id, user=current_user)
        except Document.DoesNotExist:
            return None
    
    document = await sync_to_async(get_doc)()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرک یافت نشد"
        )
    
    return DocumentResponse(
        id=str(document.id),
        document_type=document.document_type,
        title=document.title,
        description=document.description,
        file_name=document.file_name,
        file_size=document.file_size,
        file_size_mb=document.get_file_size_mb(),
        mime_type=document.mime_type,
        is_verified=document.is_verified,
        created_at=document.created_at,
        registration_id=str(document.registration.id) if document.registration else None,
        person_id=str(document.person.id) if document.person else None
    )


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Download a document file."""
    def get_doc():
        try:
            return Document.objects.get(id=document_id, user=current_user)
        except Document.DoesNotExist:
            return None
    
    document = await sync_to_async(get_doc)()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرک یافت نشد"
        )
    
    if not os.path.exists(document.file.path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="فایل یافت نشد"
        )
    
    return FileResponse(
        path=document.file.path,
        filename=document.file_name,
        media_type=document.mime_type or 'application/octet-stream'
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a document."""
    def delete_doc():
        try:
            document = Document.objects.get(id=document_id, user=current_user)
            document.delete()
            return True
        except Document.DoesNotExist:
            return False
    
    deleted = await sync_to_async(delete_doc)()
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرک یافت نشد"
        )
    
    return None


# Admin endpoints
@router.get("/admin/all", response_model=DocumentWithUserListResponse)
async def get_all_documents_admin(
    user_id: Optional[str] = None,
    is_verified: Optional[bool] = None,
    document_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all documents (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز"
        )
    
    def get_all_docs():
        documents = Document.objects.select_related('user').all()
        
        if user_id:
            documents = documents.filter(user_id=user_id)
        
        if is_verified is not None:
            documents = documents.filter(is_verified=is_verified)
        
        if document_type:
            documents = documents.filter(document_type=document_type)
        
        documents = documents.order_by('-created_at')
        
        document_list = [
            DocumentWithUserResponse(
                id=str(doc.id),
                document_type=doc.document_type,
                title=doc.title,
                description=doc.description,
                file_name=doc.file_name,
                file_size=doc.file_size,
                file_size_mb=doc.get_file_size_mb(),
                mime_type=doc.mime_type,
                is_verified=doc.is_verified,
                created_at=doc.created_at,
                registration_id=str(doc.registration.id) if doc.registration else None,
                person_id=str(doc.person.id) if doc.person else None,
                user_id=str(doc.user.id),
                user_name=doc.user.get_full_name(),
                user_email=doc.user.email
            )
            for doc in documents
        ]
        
        return DocumentWithUserListResponse(
            documents=document_list,
            total=len(document_list)
        )
    
    return await sync_to_async(get_all_docs)()


@router.patch("/{document_id}/verify", response_model=DocumentResponse)
async def verify_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Verify a document (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز"
        )
    
    def verify_doc():
        try:
            from django.utils import timezone
            document = Document.objects.get(id=document_id)
            document.is_verified = True
            document.verified_by = current_user
            document.verified_at = timezone.now()
            document.save()
            return document
        except Document.DoesNotExist:
            return None
    
    document = await sync_to_async(verify_doc)()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرک یافت نشد"
        )
    
    return DocumentResponse(
        id=str(document.id),
        document_type=document.document_type,
        title=document.title,
        description=document.description,
        file_name=document.file_name,
        file_size=document.file_size,
        file_size_mb=document.get_file_size_mb(),
        mime_type=document.mime_type,
        is_verified=document.is_verified,
        created_at=document.created_at,
        registration_id=str(document.registration.id) if document.registration else None,
        person_id=str(document.person.id) if document.person else None
    )


@router.patch("/{document_id}/unverify", response_model=DocumentResponse)
async def unverify_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Unverify a document (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز"
        )
    
    def unverify_doc():
        try:
            document = Document.objects.get(id=document_id)
            document.is_verified = False
            document.verified_by = None
            document.verified_at = None
            document.save()
            return document
        except Document.DoesNotExist:
            return None
    
    document = await sync_to_async(unverify_doc)()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرک یافت نشد"
        )
    
    return DocumentResponse(
        id=str(document.id),
        document_type=document.document_type,
        title=document.title,
        description=document.description,
        file_name=document.file_name,
        file_size=document.file_size,
        file_size_mb=document.get_file_size_mb(),
        mime_type=document.mime_type,
        is_verified=document.is_verified,
        created_at=document.created_at,
        registration_id=str(document.registration.id) if document.registration else None,
        person_id=str(document.person.id) if document.person else None
    )


@router.delete("/admin/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete any document (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز"
        )
    
    def delete_doc():
        try:
            document = Document.objects.get(id=document_id)
            document.delete()
            return True
        except Document.DoesNotExist:
            return False
    
    deleted = await sync_to_async(delete_doc)()
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرک یافت نشد"
        )
    
    return None


@router.get("/admin/{document_id}/download")
async def admin_download_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Download any document file (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز"
        )
    
    def get_doc():
        try:
            return Document.objects.get(id=document_id)
        except Document.DoesNotExist:
            return None
    
    document = await sync_to_async(get_doc)()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="مدرک یافت نشد"
        )
    
    if not os.path.exists(document.file.path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="فایل یافت نشد"
        )
    
    return FileResponse(
        path=document.file.path,
        filename=document.file_name,
        media_type=document.mime_type or 'application/octet-stream'
    )
