package ec.edu.monster.model.client;

import ec.edu.monster.model.dto.PurchaseRequest;
import ec.edu.monster.model.dto.PurchaseResponse;
import ec.edu.monster.model.entity.Purchase;
import ec.edu.monster.model.mapper.PurchaseMapper;
import ec.edu.monster.model.service.PurchaseService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RequiredArgsConstructor
public class PurchaseClient {
    private final PurchaseService service;

    public Purchase create(PurchaseRequest dto) {
        PurchaseResponse responseDto = ApiExecutor.execute(
                service.create(dto),
                Map.of(
                        400, "Datos de compra inválidos o insuficientes",
                        404, "El partido o localidad no existe"));
        return PurchaseMapper.toEntity(responseDto);
    }
}