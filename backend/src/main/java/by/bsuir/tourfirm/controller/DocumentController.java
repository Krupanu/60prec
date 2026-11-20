package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.response.DocumentDto;
import by.bsuir.tourfirm.entity.Document;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.List;

/** Документы по рейсам: загрузка, список, скачивание, удаление. */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/trips/{tripId}/documents")
    public ResponseEntity<DocumentDto> upload(@PathVariable Long tripId,
                                              @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.upload(tripId, file));
    }

    @GetMapping("/trips/{tripId}/documents")
    public List<DocumentDto> getByTrip(@PathVariable Long tripId) {
        return documentService.getByTrip(tripId);
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Document document = documentService.getForDownload(id);
        Resource resource = new FileSystemResource(Paths.get(document.getFilePath()));
        if (!resource.exists()) {
            throw new ResourceNotFoundException("Файл документа не найден на диске");
        }
        String contentType = document.getFileType() != null ? document.getFileType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        // filename="..." — ASCII-запасной вариант, filename* — оригинальное имя в UTF-8 (RFC 5987)
        String asciiName = document.getFileName().replaceAll("[^\\x20-\\x7E]", "_").replace("\"", "_");
        String encodedName = UriUtils.encode(document.getFileName(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + asciiName + "\"; filename*=UTF-8''" + encodedName)
                .body(resource);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
