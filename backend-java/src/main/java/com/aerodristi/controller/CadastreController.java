package com.aerodristi.controller;

import com.aerodristi.service.AeroDristiOrchestrator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/cadastre")
@CrossOrigin(origins = {"https://aerodristi.vercel.app", "http://localhost:3000", "http://localhost:5173"})
public class CadastreController {

    private static final Logger logger = LoggerFactory.getLogger(CadastreController.class);

    private final AeroDristiOrchestrator orchestrator;

    public CadastreController(AeroDristiOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateCadastre(@RequestParam("drone_image") MultipartFile droneImage) {
        if (droneImage.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Image file is missing or empty\"}");
        }

        try {
            String validationResult = orchestrator.generateAndValidateCadastre(droneImage);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(validationResult);
        } catch (Exception e) {
            logger.error("Failed to generate and validate cadastre.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json")
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
