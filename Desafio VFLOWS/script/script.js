$(document).ready(function () {

    /* Integração da API via cep */
    function preencherEndereco(dados) {
        $('#Endereco').val(dados.logradouro);
        $('#Bairro').val(dados.bairro);
        $('#Municipio').val(dados.localidade);
        $('#Estado').val(dados.uf);
    }

    function limparEndereco() {
        $('#Endereco').val('');
        $('#Bairro').val('');
        $('#Municipio').val('');
        $('#Estado').val('');
    }

    let cepConsultaEmAndamento = false;
    let alertaCepInvalidoMostrado = false;

    $('#CEP').blur(function () {
        const cep = $(this).val().replace(/\D/g, '');

        if (cep.length === 8 && !cepConsultaEmAndamento) {
            cepConsultaEmAndamento = true;
            const url = `https://viacep.com.br/ws/${cep}/json/`;

            $.getJSON(url, function (dados) {
                if (!('erro' in dados)) {
                    preencherEndereco(dados);
                } else {
                    limparEndereco();
                    if (!alertaCepInvalidoMostrado) {
                        alert('CEP não encontrado.');
                        alertaCepInvalidoMostrado = true;
                    }
                }
            }).fail(function () {
                limparEndereco();
                if (!alertaCepInvalidoMostrado) {
                    alert('Erro ao consultar o CEP.');
                    alertaCepInvalidoMostrado = true;
                }
            }).always(function () {
                cepConsultaEmAndamento = false;
            });
        } else if (cep.length !== 8) {
            limparEndereco();
            if (!alertaCepInvalidoMostrado) {
                alert('Formato de CEP inválido, Insira somente números.');
                alertaCepInvalidoMostrado = true;
            }
        } else {
            alertaCepInvalidoMostrado = false;
        }
    });

    /* Função para o cálculo */
    function calcularValorTotal(context) {
        const quantidade = $(context).find('.quantidade').val();
        const valorUnitario = $(context).find('.valorUnitario').val();
        const valorTotal = quantidade * valorUnitario;
        $(context).find('.valorTotal').val(valorTotal.toFixed(2));
    }

    $(document).on('input', '.quantidade, .valorUnitario', function () {
        const context = $(this).closest('.card-product');
        calcularValorTotal(context);
    });

    /* Funções dos produtos */
    let produtoIndex = 1;

    $('#add-produto').click(() => {
        const produtoItem = `
        <div class="card-product whell" id="produto-${produtoIndex}">
        <div class="col-md-3">
        <button type="button" class="btn-lx lixeira"><i class="fa-solid fa-trash fa-xl lixeira"></i></button>
        <img src="/src/img/package-diagram.svg" title="package-diagram" class="img-product">
        </div>
        <div class="form-group">
        <div class="col-md-8">
        <label for="descricao-${produtoIndex}">Produto</label>
        <input type="text" class="form-control descricao" id="descricao-${produtoIndex}" name="descricao" required>
        </div>
        <div class="form-group">
        <div class="inputs col-md-2">
        <label for="unidade_medida-${produtoIndex}">Unidade de Medida:</label>
        <select class="form-control unidadeMedida" id="unidade_medida-${produtoIndex}" name="unidade_medida" required>
        <option value="g">Gramas</option>
        <option value="kg">Quilograma</option>
        <option value="litro">Litro</option>
        </select>
        </div>
        </div>
        <div class="inputs col-md-2">
        <label for="quantidade_estoque-${produtoIndex}">Em estoque:</label>
        <input type="number" class="form-control quantidade" id="quantidade_estoque-${produtoIndex}" name="quantidade_estoque" required>
        </div>
        <div class="inputs col-md-2">
        <label for="valor_unitario-${produtoIndex}">Valor Unitário:</label>
        <input type="number" class="form-control valorUnitario" id="valor_unitario-${produtoIndex}" name="valor_unitario" required step="0.01">
        </div>
        <div class="inputs col-md-2">
        <label for="valor_total-${produtoIndex}">Valor Total:</label>
        <input type="text" class="form-control valorTotal" id="valor_total-${produtoIndex}" name="valor_total" readonly>
        </div>
        </div>
        </div>
        `;
        $('#card-container').append(produtoItem);
        produtoIndex++;
    });

    $(document).on('click', '.lixeira', function () {
        const card = $(this).closest('.card-product');
        if (card.attr('id') === 'produto-0') {
            alert('O primeiro produto não pode ser excluído, pois é obrigatório ao menos 1 produto.');
        } else {
            card.remove();
        }
    });

    /* Funções dos anexos */
    let anexoIndex = 0;
    const anexos = [];

    function atualizarArmazenamento() {
        sessionStorage.setItem('anexos', JSON.stringify(anexos));
    }

    $('#add-anexo').click(function () {
        $('#file-input').click();
    });

    $('#file-input').change(function(event) {
        const files = event.target.files;
        const $container = $('#anexos-container');

        $.each(files, function(index, file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const anexoItem = `
                <div class="anexo-item card-body" data-index="${anexoIndex}">
                <div class="row">
                <div class="col-md-1">
                <button type="button" class="remover-anexo btn-lx lixeira center-block">
                <i class="fa-solid fa-trash fa-xl lixeira"></i>
                </button>
                </div>
                <div class="col-md-1 center-block">
                <button type="button" class="visualizar-anexo eye">
                <i class="fa-regular fa-eye fa-xl" style="color: #74C0FC;"></i>
                </button>
                </div>
                <div class="col-md-2">
                <label>${file.name}</label>
                </div>
                </div>
                </div>
                `;
                $container.append(anexoItem);

                anexos.push({
                    indice: anexoIndex + 1,
                    nomeArquivo: file.name,
                    blobArquivo: e.target.result
                });
                atualizarArmazenamento();
                anexoIndex++;
            };

            reader.readAsDataURL(file);
        });
    });

    $(document).on('click', '.remover-anexo', function() {
        const $item = $(this).closest('.anexo-item');
        const index = $item.data('index');
        anexos.splice(index, 1);
        $('#anexos-container .anexo-item').each(function(i) {
            $(this).attr('data-index', i);
        });
        atualizarArmazenamento();

        $item.remove();
    });

    $(document).on('click', '.visualizar-anexo', function() {
        const $item = $(this).closest('.anexo-item');
        const index = $item.data('index');

        const anexo = anexos.find(anexo => anexo.indice === index + 1);
        if (anexo) {
            const link = document.createElement('a');
            link.href = anexo.blobArquivo;
            link.target = '_blank';
            link.download = anexo.nomeArquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Anexo não encontrado.');
        }
    });

    function validarCamposObrigatorios() {
        let isValid = true;
        $('input[required]').each(function() {
            if ($(this).val() === '') {
                isValid = false;
                $(this).css('border', '1px solid red');
            } else {
                $(this).css('border', '');
            }
        });
        return isValid;
    }

    $('#finalizar').click(function(event) {
        event.preventDefault();

        if (anexos.length === 0) {
            alert('Você deve incluir pelo menos um anexo.');
            return;
        }

        if (!validarCamposObrigatorios()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const fornecedor = {
            razaoSocial: $('#RazaoSocial').val(),
            nomeFantasia: $('#NomeFantasia').val(),
            cnpj: $('#Cnpj').val(),
            inscricaoEstadual: $('#InscricaoEstadual').val(),
            inscricaoMunicipal: $('#InscricaoMunicipal').val(),
            nomeContato: $('#NomeContato').val(),
            telefoneContato: $('#Telefone').val(),
            emailContato: $('#Email').val(),
            produtos: [],
            anexos: anexos
        };

        $('.card-product').each(function(index) {
            const produto = {
                indice: index + 1,
                descricaoProduto: $(this).find('.descricao').val(),
                unidadeMedida: $(this).find('.unidadeMedida').val(),
                qtdeEstoque: $(this).find('.quantidade').val(),
                valorUnitario: $(this).find('.valorUnitario').val(),
                valorTotal: $(this).find('.valorTotal').val()
            };
            fornecedor.produtos.push(produto);
        });

        var jsonData = {
            fornecedor
        };

        var jsonString = JSON.stringify(fornecedor);

        var myModal = FLUIGC.modal({
            title: 'Download JSON',
            content: 'Download de todos os dados do fornecedor.',
            id: 'fluig-modal',
            actions: [{
                'label': 'Download',
                'bind': 'data-download-json',
            },{
                'label': 'Fechar',
                'autoClose': true
            }]
        });

        $(document).on('click', '[data-download-json]', function() {
            var blob = new Blob([jsonString], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'dados-fornecedor.json';

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
        });

        $(document).on('hidden.bs.modal', '#fluig-modal', function() {
            console.log('JSON:', JSON.stringify(fornecedor));
            alert(fornecedor)
        });
    });
});
