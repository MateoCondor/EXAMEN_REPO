package ec.edu.monster.model.service;

import java.util.List;

import ec.edu.monster.model.dto.LocationResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;

public interface LocationService {
    @GET("localidades/{code}")
    Call<List<LocationResponse>> getBySoccerGame(@Path("code") String code);
}
