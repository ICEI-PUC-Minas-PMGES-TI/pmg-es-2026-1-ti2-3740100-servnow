package com.servnow.backend.perfil.dto;

import java.util.List;

public record ClienteCadastroSyncRequest(
    List<ClienteEnderecoRequest> enderecos,
    List<ClienteChavePixRequest> chavesPix
) {
}
