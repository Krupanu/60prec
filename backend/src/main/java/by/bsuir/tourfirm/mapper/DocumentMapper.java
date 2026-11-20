package by.bsuir.tourfirm.mapper;

import by.bsuir.tourfirm.dto.response.DocumentDto;
import by.bsuir.tourfirm.entity.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public DocumentDto toDto(Document document) {
        return DocumentDto.builder()
                .id(document.getId())
                .tripId(document.getTrip().getId())
                .ownerId(document.getOwner().getId())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .uploadedAt(document.getUploadedAt())
                .build();
    }
}
