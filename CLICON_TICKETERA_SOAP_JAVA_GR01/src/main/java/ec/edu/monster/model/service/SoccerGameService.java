package ec.edu.monster.model.service;

import ec.edu.monster.model.dto.SoccerGameResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;

public interface SoccerGameService {

    @GET("partidos")
    Call<List<SoccerGameResponse>> getAll();

}