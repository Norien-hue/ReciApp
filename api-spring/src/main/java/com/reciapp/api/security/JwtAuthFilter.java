package com.reciapp.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String header = request.getHeader("Authorization");

        log.info("[JWT-FILTER] >>> {} {} | Auth header: {}", method, uri,
                header != null ? "Bearer ***" + header.substring(Math.max(7, header.length() - 10)) : "NINGUNO");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtService.isValid(token)) {
                var claims = jwtService.parseToken(token);
                Integer userId = Integer.parseInt(claims.getSubject());
                String permisos = claims.get("permisos", String.class);

                log.info("[JWT-FILTER] Token valido. userId={}, permisos={}", userId, permisos);

                var auth = new UsernamePasswordAuthenticationToken(
                    userId, null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + (permisos != null ? permisos.toUpperCase() : "CLIENTE")))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                log.warn("[JWT-FILTER] Token INVALIDO para {} {}", method, uri);
            }
        } else {
            log.info("[JWT-FILTER] Sin token para {} {} (pasa a Spring Security)", method, uri);
        }

        chain.doFilter(request, response);

        log.info("[JWT-FILTER] <<< {} {} -> Status: {}", method, uri, response.getStatus());
    }
}
