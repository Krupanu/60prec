package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.response.DocumentDto;
import by.bsuir.tourfirm.entity.Document;
import by.bsuir.tourfirm.entity.Trip;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.entity.enums.Role;
import by.bsuir.tourfirm.exception.BadRequestException;
import by.bsuir.tourfirm.exception.ForbiddenException;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.DocumentMapper;
import by.bsuir.tourfirm.repository.DocumentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * Документы по рейсам (путевые листы и т.п.).
 * Файлы сохраняются на диск в каталог, заданный app.upload-dir (env UPLOAD_DIR).
 */
@Slf4j
@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final TripService tripService;
    private final CurrentUserService currentUserService;
    private final DocumentMapper documentMapper;
    private final Path uploadDir;

    public DocumentService(DocumentRepository documentRepository,
                           TripService tripService,
                           CurrentUserService currentUserService,
                           DocumentMapper documentMapper,
                           @Value("${app.upload-dir}") String uploadDir) {
        this.documentRepository = documentRepository;
        this.tripService = tripService;
        this.currentUserService = currentUserService;
        this.documentMapper = documentMapper;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    /** Загрузка документа владельцем транспорта, назначенного на рейс. */
    @Transactional
    public DocumentDto upload(Long tripId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Файл не выбран или пуст");
        }
        Trip trip = tripService.findTrip(tripId);
        User current = currentUserService.getCurrentUser();
        checkTripOwner(trip, current);

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String storedName = UUID.randomUUID() + "_" + originalName.replaceAll("[^\\w.\\-]", "_");
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(storedName);
            file.transferTo(target);

            Document document = Document.builder()
                    .trip(trip)
                    .owner(current)
                    .fileName(originalName)
                    .fileType(file.getContentType())
                    .filePath(target.toString())
                    .build();
            return documentMapper.toDto(documentRepository.save(document));
        } catch (IOException e) {
            log.error("Ошибка сохранения файла {}", originalName, e);
            throw new UncheckedIOException("Не удалось сохранить файл", e);
        }
    }

    /** Список документов рейса: владелец ТС рейса или менеджер. */
    @Transactional(readOnly = true)
    public List<DocumentDto> getByTrip(Long tripId) {
        Trip trip = tripService.findTrip(tripId);
        User current = currentUserService.getCurrentUser();
        checkOwnerOrManager(trip, current);
        return documentRepository.findAllByTripId(tripId).stream()
                .map(documentMapper::toDto)
                .toList();
    }

    /** Проверка доступа и получение документа для скачивания. */
    @Transactional(readOnly = true)
    public Document getForDownload(Long id) {
        Document document = findDocument(id);
        User current = currentUserService.getCurrentUser();
        checkOwnerOrManager(document.getTrip(), current);
        return document;
    }

    /** Удаление документа: владелец ТС рейса или менеджер. Файл удаляется с диска. */
    @Transactional
    public void delete(Long id) {
        Document document = findDocument(id);
        User current = currentUserService.getCurrentUser();
        checkOwnerOrManager(document.getTrip(), current);
        documentRepository.delete(document);
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (IOException e) {
            log.warn("Не удалось удалить файл {} с диска", document.getFilePath(), e);
        }
    }

    private Document findDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Документ не найден: id=" + id));
    }

    private void checkTripOwner(Trip trip, User current) {
        if (!trip.getTransport().getOwner().getId().equals(current.getId())) {
            throw new ForbiddenException("Загружать документы может только владелец транспорта рейса");
        }
    }

    private void checkOwnerOrManager(Trip trip, User current) {
        boolean isOwner = trip.getTransport().getOwner().getId().equals(current.getId());
        if (!isOwner && current.getRole() != Role.MANAGER) {
            throw new ForbiddenException("Доступ к документам рейса запрещён");
        }
    }
}
