package ec.edu.monster.rest;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

@Provider
@PreMatching
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
            requestContext.abortWith(Response.ok().build());
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext)
            throws IOException {
        String origin = requestContext.getHeaderString("Origin");
        String requestHeaders = requestContext.getHeaderString("Access-Control-Request-Headers");

        responseContext.getHeaders().putSingle(
                "Access-Control-Allow-Origin",
                origin == null || origin.isEmpty() ? "*" : origin
        );
        responseContext.getHeaders().putSingle("Vary", "Origin");
        responseContext.getHeaders().putSingle(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS, HEAD"
        );
        responseContext.getHeaders().putSingle(
                "Access-Control-Allow-Headers",
                requestHeaders == null || requestHeaders.isEmpty()
                        ? "Origin, Content-Type, Accept, Authorization"
                        : requestHeaders
        );
        responseContext.getHeaders().putSingle("Access-Control-Max-Age", "3600");
    }
}
