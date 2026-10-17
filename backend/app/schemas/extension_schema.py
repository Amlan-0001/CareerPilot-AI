from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class FormFieldItem(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    label: Optional[str] = None
    type: Optional[str] = "text"


class ExtractJDRequest(BaseModel):
    page_text: str
    page_url: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None


class ExtractJDResponse(BaseModel):
    job_title: str
    company_name: str
    job_description: str
    analysis: Dict[str, Any]


class FillFormRequest(BaseModel):
    fields: List[FormFieldItem]
    job_description: Optional[str] = None


class FillFormResponse(BaseModel):
    fields: List[Dict[str, Any]]


# Aliases for backward compatibility
ExtensionExtractJDRequest = ExtractJDRequest
ExtensionFillFormRequest = FillFormRequest
ExtensionFillFormResponse = FillFormResponse
