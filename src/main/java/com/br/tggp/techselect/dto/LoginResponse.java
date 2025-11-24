package com.br.tggp.techselect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private Long idRecrutador;
    private String token;
    private String nome;
    private String email;
    private String nomeEmpresa;
    private String urlLogo;
}
