package ec.edu.monster.model.client;

import ec.edu.monster.model.dto.SoccerGameResponse;
import ec.edu.monster.model.entity.SoccerGame;
import ec.edu.monster.model.mapper.SoccerGameMapper;
import ec.edu.monster.model.service.SoccerGameService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class SoccerGameClient {
    private final SoccerGameService service;

    public List<SoccerGame> getAll() {
        List<SoccerGameResponse> dtos = ApiExecutor.execute(service.getAll());
        return dtos.stream()
                .map(SoccerGameMapper::toEntity)
                .collect(Collectors.toList());
    }
}