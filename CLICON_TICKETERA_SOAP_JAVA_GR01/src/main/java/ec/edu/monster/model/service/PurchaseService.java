package ec.edu.monster.model.service;

import ec.edu.monster.model.dto.PurchaseRequest;
import ec.edu.monster.model.dto.PurchaseResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface PurchaseService {

    @POST("comprar")
    Call<PurchaseResponse> create(@Body PurchaseRequest dto);

}