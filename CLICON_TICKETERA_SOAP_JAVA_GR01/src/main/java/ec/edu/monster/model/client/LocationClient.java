package ec.edu.monster.model.client;

import ec.edu.monster.model.dto.LocationResponse;
import ec.edu.monster.model.entity.Location;
import ec.edu.monster.model.mapper.LocationMapper;
import ec.edu.monster.model.service.LocationService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class LocationClient {
    private final LocationService service;

    public List<Location> getBySoccerGame(String code) {
        List<LocationResponse> dtos = ApiExecutor.execute(
                service.getBySoccerGame(code),
                Map.of(404, "El partido especificado no existe"));

        return dtos.stream()
                .map(LocationMapper::toEntity)
                .collect(Collectors.toList());
    }
}