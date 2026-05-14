package com.reciapp.api.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    @GetMapping("/")
    public Map<String, String> root() {
        log.info("[HEALTH] >>> Peticion recibida en /");
        return Map.of("name", "ReciApp API", "version", "1.0.0");
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        log.info("[HEALTH] >>> Peticion recibida en /api/health");
        return Map.of("status", "ok");
    }
}
