package com.aerodristi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class AeroDristiOrchestrator {

    private static final Logger logger = LoggerFactory.getLogger(AeroDristiOrchestrator.class);

    private final RestTemplate restTemplate;
    private final CadastralValidationService validationService;
    private final ObjectMapper objectMapper;

    @Value("${fastapi.engine.url:http://localhost:8000/api/v1/engine/synthesize}")
    private String fastApiUrl;

    public AeroDristiOrchestrator(RestTemplate restTemplate, CadastralValidationService validationService) {
        this.restTemplate = restTemplate;
        this.validationService = validationService;
        this.objectMapper = new ObjectMapper();
    }

    public String generateAndValidateCadastre(MultipartFile imageFile) throws Exception {
        logger.info("Orchestrator: Received image '{}'. Initiating ML synthesis pipeline...", imageFile.getOriginalFilename());

        // 1. Post to FastAPI for Neural Inference & Tessellation
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(imageFile.getBytes()) {
            @Override
            public String getFilename() {
                return imageFile.getOriginalFilename() != null ? imageFile.getOriginalFilename() : "image.jpg";
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        logger.info("Orchestrator: Calling FastAPI Synthesis Engine at {}", fastApiUrl);
        ResponseEntity<String> response = restTemplate.exchange(
                fastApiUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            logger.error("FastAPI returned error status: {}", response.getStatusCode());
            throw new RuntimeException("Failed to synthesize parcels in ML engine");
        }

        // 2. Parse FastAPI response
        logger.info("Orchestrator: Received synthesis output. Proceeding to topological validation.");
        JsonNode engineOutput = objectMapper.readTree(response.getBody());
        
        String synthesizedParcelsStr = engineOutput.get("synthesized_parcels").toString();
        String buildingFootprintsStr = engineOutput.get("building_footprints").toString();

        // 3. Delegate to CadastralValidationService
        String validatedResult = validationService.validateTopology(synthesizedParcelsStr, buildingFootprintsStr);
        
        logger.info("Orchestrator: Pipeline execution complete.");
        return validatedResult;
    }
}
