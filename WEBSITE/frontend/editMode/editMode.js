// Carregar questões ao carregar a página
function onload() {
    readQuestionsFromDatabase();
    checkLogin();
}
// Constante id do diagnoses
const diagnosisid = 4;

//funçao para ver se esta logado
function checkLogin(){
    if (localStorage.getItem("loggedIn") === "false" || localStorage.getItem("table") != "employee") {
        // alert('Você não tem permissão para ver esta página. Entre como gestor escolar para proceder.');
        Swal.fire({
            icon: 'error',
            title: 'Você não tem permissão para ver esta página',
            text: ' Entre como administrador para proceder'
        })
        window.location = "../index.html";
    }
}

// Reinicia modal de adicionar questões
function addModal() {
    // Deixa dropdowns em branco
    $('#axis-dropdown').val('')
    $('#critical-factors').val('')

    // Deixa alternativas em branco
    $('#alternative1').val('')
    $('#alternative2').val('')
    $('#alternative3').val('')
    $('#alternative4').val('')
    $('#alternative5').val('')

    // Deixa pesos em branco
    $('#weight').val('');
    $('#alternativeweight1').val('')
    $('#alternativeweight2').val('')
    $('#alternativeweight3').val('')
    $('#alternativeweight4').val('')
    $('#alternativeweight5').val('')

    // Deixar campo de enunciado em branco
    $("#question").val('');

    // Esconde botão de deletar eixo subeixo e campos de adicionar eixo e subeixo
    $("#delete-axis").hide();
    $("#delete-subaxis").hide();
    $("#add-axis-span").hide();
    $("#add-subaxis-span").hide();
    updateAddModalDropdowns();

}

// Atualiza dropdowns do modal de adicionar questão
function updateAddModalDropdowns() {
    let axes = getAxes();
    document.getElementById('axis-dropdown').innerHTML = "<option value='' disabled selected>Escolher...</option>";
    axes.forEach(axis => {
        document.getElementById('axis-dropdown').innerHTML += `<option value="${axis['name']}">${axis['name']}</option>`
    })
    document.getElementById('critical-factors').innerHTML = "<option value='' disabled selected>Escolher...</option>";


}

// Salva nova questão no modal de adicionar questões
function saveQuestion() {
    if ($('#axis-dropdown').val() === null || $('#critical-factors').val() === null) {
        Swal.fire({
            icon: 'error',
            title: 'Escolha um eixo e fator crítico para adicionar a questão',
        })
    } else if ($('#question').val() === '') {
        Swal.fire({
            icon: 'error',
            title: 'Preencha o enunciado da questão para continuar.',
        })
    } else if ($('#weight').val() === '') {
        Swal.fire({
            icon: 'error',
            title: 'Preencha o peso da questão para continuar',
        })
    } else if (($('#alternative1').val() != '' && $('#alternativeweight1').val() === '') ||
        ($('#alternative2').val() != '' && $('#alternativeweight2').val() === '') ||
        ($('#alternative3').val() != '' && $('#alternativeweight3').val() === '') ||
        ($('#alternative4').val() != '' && $('#alternativeweight4').val() === '') ||
        ($('#alternative5').val() != '' && $('#alternativeweight5').val() === '')) {
        Swal.fire({
            icon: 'error',
            title: 'Preencha os pesos das alternativas para adicionar a questão',
        })
    } else {
        $.ajax({
            url: "http://127.0.0.1:1234/questioninsert",
            type: 'POST',
            async: false,
            data: {
                weight: parseInt($("#weight").val()),
                text: $("#question").val(),
                axis_subdivision_id: findSubdivisionIDFromName($('#critical-factors').val()),
                axis_id: getAxisIdFromName($('#axis-dropdown').val()),
                diagnosis_id: diagnosisid
            }
        });
        let lastId = getLastQuestionId()
        saveAlternatives(lastId);
        readQuestionsFromDatabase();
        $('#addModal').modal('toggle');

    }
}

// Informa o último id automático da última questão
function saveQuestionChanges(question_id) {
    if ($('#edit-axis-dropdown').val() === null || $('#edit-critical-factors').val() === null) {
        Swal.fire({
            icon: 'error',
            title: 'Escolha um eixo e fator crítico para salvar a questão',
        })
    } else if ($('#edit-question').val() === '') {
        Swal.fire({
            icon: 'error',
            title: 'Preencha o enunciado da questão para continuar',
        })
    } else if ($('#edit-weight').val() === '') {
        Swal.fire({
            icon: 'error',
            title: 'Preencha o peso da questão para continuar',
        })
    } else if (($('#edit-alternative1').val() != '' && $('#edit-alternativeweight1').val() === '') ||
        ($('#edit-alternative2').val() != '' && $('#edit-alternativeweight2').val() === '') ||
        ($('#edit-alternative3').val() != '' && $('#edit-alternativeweight3').val() === '') ||
        ($('#edit-alternative4').val() != '' && $('#edit-alternativeweight4').val() === '') ||
        ($('#edit-alternative5').val() != '' && $('#edit-alternativeweight5').val() === '')) {
        Swal.fire({
            icon: 'error',
            title: 'Preencha os pesos das alternativas para salvar a questão',
        })
    } else {
        $.ajax({
            url: "http://127.0.0.1:1234/questionupdate",
            type: 'POST',
            async: false,
            data: {
                id: question_id,
                weight: parseInt($("#edit-weight").val()),
                text: $("#edit-question").val(),
                axis_subdivision_id: findSubdivisionIDFromName($('#edit-critical-factors').val()),
                axis_id: getAxisIdFromName($('#edit-axis-dropdown').val()),
                diagnosis_id: diagnosisid
            }
        });
        saveAlternativeChanges(question_id);
        readQuestionsFromDatabase();
        $('#editModal').modal('toggle');
    }
}

function getLastQuestionId() {
    var highestId = 0;
    $.ajax({
        url: "http://127.0.0.1:1234/questions",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(question => {
                if (question['id'] > highestId) {
                    highestId = question['id'];
                }
            })
        }
    });
    return highestId;
}
// Salva o id e o Nome de cada eixo 
function getAxisIdFromName(name) {
    let id = null;
    $.ajax({
        url: "http://127.0.0.1:1234/axes",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (element['name'] === name) {
                    id = element['id'];
                }
            });
        }
    });
    return id;
}

let critical_factors = [];

// Salva a subdivisão de cada eixo 
function getSubdivisionsFromAxisId(axis_id) {
    subdivisions = [];
    $.ajax({
        url: "http://127.0.0.1:1234/axissubdivisions",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (parseInt(axis_id) === (element['axis_id'])) {
                    subdivisions.push(element)
                }
            });
        }
    });
    return subdivisions;
}

// Realiza o dropdown para os eixos de cada agenda 
$("#axis-dropdown").change(function () {
    if ($("#axis-dropdown").val() === "") {
        $("#delete-axis").hide();
    } else {
        $("#delete-axis").show();
        let subdivisions = getSubdivisionsFromAxisId(getAxisIdFromName($("#axis-dropdown").val()));
        document.getElementById('critical-factors').innerHTML = "<option value='' disabled selected>Escolher...</option>";
        subdivisions.forEach(subdivision => {
            document.getElementById('critical-factors').innerHTML += `<option value="${subdivision['name']}">${subdivision['name']}</option>`
        })
    }
});

// Subdivisão de eixos, ou seja, os fatores críticos 
$("#critical-factors").change(function () {
    if ($("#critical-factor").val() === "") {
        $("#delete-subaxis").hide();
    } else {
        $("#delete-subaxis").show();
    }
});

// Salva as edições do dropdown dos eixos 
$("#edit-axis-dropdown").change(function () {
    if ($("#edit-axis-dropdown").val() === "") {
        $("#edit-delete-axis").hide();
    } else {
        let subdivisions = getSubdivisionsFromAxisId(getAxisIdFromName($("#edit-axis-dropdown").val()));
        document.getElementById('edit-critical-factors').innerHTML = "<option value='' disabled selected>Escolher...</option>";
        subdivisions.forEach(subdivision => {
            document.getElementById('edit-critical-factors').innerHTML += `<option value="${subdivision}">${subdivision}</option>`
        })
    }
});

// Encontra o id do nome de cada subdivisão criada
function findSubdivisionIDFromName(name) {
    let id = ''
    $.ajax({
        url: "http://127.0.0.1:1234/axissubdivisions",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (name === element['name']) {
                    id = element['id'];
                }
            })
        }



    })
    return id;

}

// Salva as alternativas com o id de cada questão 
function saveAlternatives(question_id) {
    for (let i = 1; i <= 5; i++) {
        if ($("#alternative" + i).val() != "") {
            $.ajax({
                url: "http://127.0.0.1:1234/optioninsert",
                type: 'POST',
                async: false,
                data: {
                    weight: $("#alternativeweight" + i).val(),
                    text: $("#alternative" + i).val(),
                    question_id: question_id,
                    position: i,
                    axis_subdivision_id: findSubdivisionIDFromName($('#critical-factors').val()),
                    axis_id: getAxisIdFromName($('#axis-dropdown').val()),
                    diagnosis_id: diagnosisid
                }
            });
        }
    }
}

// Salva mudanças das alternativas que forem feitas 
function saveAlternativeChanges(question_id) {
    original_alternatives = getAlternatives(question_id);
    for (let i = 0; i < original_alternatives.length; i++) {
        $.ajax({
            url: "http://127.0.0.1:1234/optiondelete",
            type: 'POST',
            async: false,
            data: {
                id: original_alternatives[i]['id'],
            }
        });
    }

    // Função que insere até cinco alternativas se preenchidas 
    let currentPosition = 1;
    for (let i = 1; i <= 5; i++) {
        if ($("#edit-alternative" + i).val() != "") {
            $.ajax({
                url: "http://127.0.0.1:1234/optioninsert",
                type: 'POST',
                async: false,
                data: {
                    weight: $("#edit-alternativeweight" + i).val(),
                    text: $("#edit-alternative" + i).val(),
                    question_id: question_id,
                    position: currentPosition,
                    axis_subdivision_id: findSubdivisionIDFromName($('#edit-critical-factors').val()),
                    axis_id: getAxisIdFromName($('#edit-axis-dropdown').val()),
                    diagnosis_id: diagnosisid
                }
            });
            currentPosition++;
        }
    }
}

// Função que salva os eixos
function getAxes() {
    var axes = [];
    $.ajax({
        url: "http://127.0.0.1:1234/axes",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (parseInt(element['diagnosis_id']) === diagnosisid) {
                    axes.push(element);
                }
            });
        }
    });
    return axes;
}

// Salva o id e o Nome de cada eixo 
function getAxisIdFromName(name) {
    let id = null;
    $.ajax({
        url: "http://127.0.0.1:1234/axes",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (element['name'] === name) {
                    id = element['id'];
                }
            });
        }
    });
    return id;
}

// Botão que ao clicado esconde o segundo span 
$('#add-axis').on('click', function (event) {
    if ($('#add-axis-span').is(":visible")) {
        $('#add-axis-span').hide();
    } else {
        $('#add-axis-span').show();
    }
});

// Função que deleta o eixo selecionado 
function deleteAxis(axis_id) {
    if ($('#axis-dropdown').val() != '') {
        let questions = getAllQuestionsFromAxis(axis_id);
        questions.forEach(question => {
            deleteQuestion(question['id']);
        });
        let subaxes = getSubdivisionsFromAxisId(axis_id);
        subaxes.forEach(subaxis => {
            deleteSubaxis(subaxis['id'])
        })
        $.ajax({
            url: "http://127.0.0.1:1234/axisdelete",
            type: 'POST',
            async: false,
            data: {
                id: axis_id
            }
        });


    }
}

// Confirmação de deletar o eixo 
$('#delete-axis').on('click', function (event) {
    if ($("#axis-dropdown").val() != '' &&
        confirm("Tem certeza de que deseja deletar este eixo? Todas as questões associadas a ele (inclusive esta) serão excluídas.")) {
        let axis_id = getAxisIdFromName($("#axis-dropdown").val());
        deleteAxis(axis_id)
        readQuestionsFromDatabase();
        updateAddModalDropdowns();
        $("#critical-factors").val("");
        document.getElementById('critical-factors').innerHTML = "<option value='' disabled selected>Escolher...</option>";
        $('#delete-axis').hide();
    } else if ($("#axis-dropdown").val() === '' || $("#axis-dropdown").val() === null) {
        Swal.fire({
            icon: 'error',
            title: 'Selecione um fator crítico no dropdown para deletá-lo',
        })
    }
});

// Confirmação de deletar a subdivisão de cada eixo 
$('#delete-subaxis').on('click', function (event) {
    if ($("#critical-factors").val() != '' &&
        confirm("Tem certeza de que deseja deletar este fator crítico? Todas as questões associadas a ele (inclusive esta) serão excluídas.")) {
        let currentAxis = $("#axis-dropdown").val();
        let subaxis_id = getSubaxisIdFromName($("#critical-factors").val());
        let questions = getQuestionsFromSubaxis(subaxis_id);
        questions.forEach(question => {
            deleteQuestion(question['id']);
        })
        deleteSubaxis(subaxis_id)
        readQuestionsFromDatabase();
        updateAddModalDropdowns();
        $("#axis-dropdown").val(currentAxis);
        $("#critical-factors").val("");

        document.getElementById('critical-factors').innerHTML = "<option value='' disabled selected>Escolher...</option>";
    } else if ($("#critical-factors").val() === '' || $("#critical-factors").val() === null) {
        Swal.fire({
            icon: 'error',
            title: 'Selecione um fator crítico no dropdown para deletá-lo',
        })
    }
});

// Deleta a subdivisão 
function deleteSubaxis(subaxis_id) {
    $.ajax({
        url: "http://127.0.0.1:1234/axissubdivisiondelete",
        type: 'POST',
        async: false,
        data: {
            id: subaxis_id
        }
    });
}

// Confirmação para deletar o subeixo ( fatores críticos )
$('#edit-delete-subaxis').on('click', function (event) {
    if ($("#edit-critical-factors").val() != '' &&
        confirm("Tem certeza de que deseja deletar este fator crítico? Todas as questões associadas a ele (inclusive esta) serão excluídas.")) {
        console.log("insde")
        let subaxis_id = getSubaxisIdFromName($("#edit-critical-factors").val());
        let questions = getQuestionsFromSubaxis(subaxis_id);
        questions.forEach(question => {
            deleteQuestion(question['id']);
        })
        deleteSubaxis(subaxis_id)
        readQuestionsFromDatabase();
        $('#editModal').modal('toggle');

    } else if ($("#edit-critical-factors").val() === '' || $("#edit-critical-factors").val() === null) {
        Swal.fire({
            icon: 'error',
            title: 'Selecione um eixo no dropdown para deletá-lo',
        })
    }
});

$('#edit-delete-axis').on('click', function (event) {
    if ($("#edit-axis-dropdown").val() != '' &&
        confirm("Tem certeza de que deseja deletar este eixo? Todas as questões associadas a ele (inclusive esta) serão excluídas.")) {
        let axis_id = getAxisIdFromName($("#edit-axis-dropdown").val());
        deleteAxis(axis_id)
        readQuestionsFromDatabase();
        updateAddModalDropdowns();
        $('#editModal').modal('toggle');
    } else if ($("#edit-axis-dropdown").val() === '' || $("#edit-axis-dropdown").val() === null) {
        Swal.fire({
            icon: 'error',
            title: 'Selecione um eixo no dropdown para deletá-lo',
        })
    }
});


$('#edit-add-axis').on('click', function (event) {
    if ($('#edit-add-axis-span').is(":visible")) {
        $('#edit-add-axis-span').hide();
    } else {
        $('#edit-add-axis-span').show();
    }
});

// Botão que ao clicado salva o eixo 
$('#save-axis').on('click', function (event) {
    let axis_name = $('#add-axis-input').val();
    $.ajax({
        url: "http://127.0.0.1:1234/axisinsert",
        type: 'POST',
        async: false,
        data: {
            name: axis_name,
            diagnosis_id: diagnosisid,
        }
    });
    $('#add-axis-input').val("");
    $('#add-axis-span').hide();
    updateAddModalDropdowns();
    $('#axis-dropdown').val(axis_name);
    $('#delete-axis').show();
});

$('#edit-save-axis').on('click', function (event) {
    let axis_name = $('#edit-add-axis-input').val();
    $.ajax({
        url: "http://127.0.0.1:1234/axisinsert",
        type: 'POST',
        async: false,
        data: {
            name: axis_name,
            diagnosis_id: diagnosisid,
        }
    });
    $('#edit-add-axis-input').val("");
    $('#edit-add-axis-span').hide();
    addModal();
});

// Esconde o span do subeixo 
$('#add-subaxis').on('click', function (event) {
    if ($('#add-subaxis-span').is(":visible")) {
        $('#add-subaxis-span').hide();
    } else {
        $('#add-subaxis-span').show();
    }
});

// Esconde o span do subeixo para a sua edição 
$('#edit-add-subaxis').on('click', function (event) {
    if ($('#edit-add-subaxis-span').is(":visible")) {
        $('#edit-add-subaxis-span').hide();
    } else {
        $('#edit-add-subaxis-span').show();
    }
});

// Função do subeixo de acordo com o nome e id 
function getSubaxisIdFromName(name) {
    console.log("subaxis name: " + name)
    let id = -1;
    $.ajax({
        url: "http://127.0.0.1:1234/axissubdivisions",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(subaxis => {
                console.log("this subaxis: " + subaxis)
                if (name === subaxis['name']) {
                    id = subaxis['id']
                }
            });
        }
    });
    return id

}

// Salva o subeixo e alarta para selecionar o eixo para só então adicionar um fator crítico 
$('#save-subaxis').on('click', function (event) {
    let axis = $("#axis-dropdown").val();
    if ($("#axis-dropdown").val() === '' || $("#axis-dropdown").val() === null) {
        return Swal.fire({
            icon: 'error',
            title: 'Selecione um eixo para adicionar um fator crítico',
        })

        alert("Selecione um eixo para adicionar um fator crítico");
    }
    let subaxis_name = $('#add-subaxis-input').val();
    $.ajax({
        url: "http://127.0.0.1:1234/axissubdivisioninsert",
        type: 'POST',
        async: false,
        data: {
            name: subaxis_name,
            axis_id: getAxisIdFromName(axis),
            diagnosis_id: diagnosisid,
        }
    });

    // Dropdown dos subeixos depois que forem criados 
    $('#add-subaxis-input').val("");
    $('#add-subaxis-span').hide();
    let subdivisions = getSubdivisionsFromAxisId(getAxisIdFromName(axis));
    document.getElementById('critical-factors').innerHTML = "<option value='' disabled selected>Escolher...</option>";
    subdivisions.forEach(subdivision => {
        document.getElementById('critical-factors').innerHTML += `<option value="${subdivision['name']}">${subdivision['name']}</option>`
    })
    $('#critical-factors').val(subaxis_name)
    $('#axis-dropdown').val(axis)
    $('#delete-subaxis').show();
});

// Edição do subeixo quando clicado 
$('#edit-save-subaxis').on('click', function (event) {
    let subaxis_name = $('#edit-add-subaxis-input').val();
    $.ajax({
        url: "http://127.0.0.1:1234/axissubdivisioninsert",
        type: 'POST',
        async: false,
        data: {
            name: subaxis_name,
            axis_id: getAxisIdFromName($("#edit-axis-dropdown").val()),
            diagnosis_id: diagnosisid,
        }
    });
    $('#edit-add-subaxis-input').val("");
    $('#edit-add-subaxis-span').hide();
    updateEditModal();
});

// Traz as informações de nome e id do eixo do banco de dados para a tela  
function getAxisFromId(id) {
    var name = null;
    $.ajax({
        url: "http://127.0.0.1:1234/axes",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (parseInt(element['id']) === parseInt(id)) {
                    name = element['name'];
                }
            });
        }
    });
    return name;
}

let alternatives = [];

// Função que salva as alternativas criadas 
function getAlternatives(question_id) {
    alternatives = [];
    $.ajax({
        url: "http://127.0.0.1:1234/options",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (parseInt(question_id) === parseInt(element['question_id'])) {
                    alternatives.push(element);
                }
            })
        }
    })
    return alternatives;
}

//Função que salva as respostas selecionadas 
function getAnswers(question_id) {
    let answers = [];
    $.ajax({
        url: "http://127.0.0.1:1234/answerS",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(answer => {
                if (parseInt(question_id) === parseInt(answer['question_id'])) {
                    answers.push(answer);
                }
            })
        }

    })
    return answers;
}

// Função que delata as questões, com os id's, enunciado, alternativas e respostas 
function deleteQuestion(question_id) {
    let answers = getAnswers(question_id);
    console.log(answers)
    answers.forEach(answer => {
        $.ajax({
            url: "http://127.0.0.1:1234/answerdelete",
            type: 'POST',
            async: false,
            data: {
                id: answer['id']
            }
        });
    })
    let alternatives = getAlternatives(question_id);
    alternatives.forEach(alternative => {
        $.ajax({
            url: "http://127.0.0.1:1234/optiondelete",
            type: 'POST',
            async: false,
            data: {
                id: alternative['id']
            }
        });
    });
    $.ajax({
        url: "http://127.0.0.1:1234/questiondelete",
        type: 'POST',
        async: false,
        data: {
            id: question_id
        }
    });
    readQuestionsFromDatabase();
}

//Função que slava as questões em cada subeixos
function getQuestionsFromSubaxis(subaxis_id) {
    let questions = [];
    $.ajax({
        //Url do endpoint
        url: "http://127.0.0.1:1234/questions",
        //Tipo da requisição
        type: 'GET',
        async: false,
        //Se obtiver sucesso, executar a arrow function abaixo
        success: data => {
            //Se não tiver questão no banco de dados, retorna um div do html com esse texto
            data.forEach(question => {
                if (question['axis_subdivision_id'] === subaxis_id) {

                    questions.push(question);
                }
            })
        }
        //ForEach faz loop que vai passar por cada elemento dentro do data
    });
    return questions;
}

function getQuestionsByAxis() {
    let axes = getAxes();
    const questions = {};
    axes.forEach(axis => {
        questions[axis['id']] = []
    });

    $.ajax({
        //url do endpoint
        url: "http://127.0.0.1:1234/questions",
        //tipo da requisição
        type: 'GET',
        //se obtiver sucesso, executar a arrow function abaixo
        success: data => {
            //se não tiver questão no banco de dados, retorna um div do html com esse texto
            if (data.length == 0) {
            }
            //se tiver questão, limpa o questionsContainer
            else {
                data.forEach(question => {
                    if (question['axis_id'] in questions) {
                        questions[question['axis_id']].push(question);
                    }
                })
            }
            //forEach faz loop que vai passar por cada elemento dentro do data
        }
    });
    return questions;
}

function getAllQuestionsFromAxis(axis_id) {
    questions = [];
    $.ajax({
        //url do endpoint
        url: "http://127.0.0.1:1234/questions",
        //tipo da requisição
        type: 'GET',
        async: false,
        //se obtiver sucesso, executar a arrow function abaixo
        success: data => {
            //se não tiver questão no banco de dados, retorna um div do html com esse texto
            //se tiver questão, limpa o questionsContainer
            data.forEach(question => {
                if (question['axis_id'] === axis_id) {
                    questions.push(question);
                }
            })
            //forEach faz loop que vai passar por cada elemento dentro do data
        }
    });
    return questions;
}

// Função que cria o accordion dos eixos após criados 
function createAxisAccordions(container) {
    let axes = getAxes()
    axes.forEach(axis => {
        console.log(axis)
        let axisName = axis['name'].replaceAll(' ', '-');
        document.getElementById(`${container}`).innerHTML += `<div class="accordion" id="${axisName}Accordion">
          <div class="accordion-item">
    <h2 class="accordion-header" id="headingTwo">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${axisName}" aria-expanded="false" aria-controls="${axisName}">
        ${axis['name']}
      </button>
    </h2>
    <div id="${axisName}" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
      <div class="accordion-body" id="${axisName}-body">
      </div>
    </div>
  </div>`
    })
}

// Função que faz aparecer as questões cadastradas divididas por eixos e subeixos em cada questionário 
function showQuestionsByAxis() {
    var questionNumber = 0;
    let axes = getAxes()
    axes.forEach(axis => {
        let axisName = axis['name'].replaceAll(" ", "-");
        let subdivisions = getSubdivisionsFromAxisId(axis['id']);
        subdivisions.forEach(subdivision => {
            let questions = getQuestionsFromSubaxis(subdivision['id']);
            if (questions.length > 0) {
                document.getElementById(`${axisName}-body`).innerHTML += `<h4 class="yellow">${subdivision['name']}</h4>`;
                questions.forEach(question => {
                    document.getElementById(`${axisName}-body`).innerHTML += `
                <div id = "question${questionNumber}" >
                    <div class='row'>
                        <div class="col-sm-9">
                            <p style="font-size:16px;">${question['text']}</p>
                        </div>
                        <div class="col-sm-3">
                        </row>
                        <span>
                            <button type="button" id="trash${question['id']}" class="btn btn-light" onclick="deleteQuestion(${question['id']})">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                                </svg>
                            </button>
                            <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#editModal" onclick="updateEditModal(${question['id']})">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                            </button>
                        </span>
                    </div>
            `
                    let alternatives = getAlternatives(question['id']);
                    alternatives.forEach(alternative => {
                        document.getElementById(`${axis['name']}-body`).innerHTML +=
                            `<div class="form-check">
                <input class="form-check-input" type="radio" name="question${question['id']}" id="flexRadioDefault1">
                    <label class="form-check-label" for="flexRadioDefault1">${alternative['text']}</label>
                </div>`
                    })
                    document.getElementById(`${axis['name']}-body`).innerHTML += "</div><hr>";
                });
                questionNumber++;
            }

            document.getElementById(`${axis['name']}-body`).innerHTML += "<br>";
        });
    })
}

// Função que verifica se existe eixo no banco de dados 
function questionsExist() {
    let questionsExist = false;
    $.ajax({
        url: "http://127.0.0.1:1234/questions",
        type: 'GET',
        async: false,
        success: data => {
            if (data.length > 0) {
                questionsExist = true;
            }
        }

    })
    return questionsExist;
}

// Função que confere se há questões, não houvendo ela mostra o alrta para adicionar novas questões
function readQuestionsFromDatabase() {
    if (questionsExist()) {
        document.getElementById("questions-container").innerHTML = '';
        createAxisAccordions("questions-container");
        showQuestionsByAxis();
    } else {
        document.getElementById("questions-container").innerHTML = `
                <div id = "questions-placeholder"> Ainda não há questões neste questionário. 
        Clique no + para adicionar.</div>`;
    }

}

// Inicia modal de edição de perguntas com dados atuais pré-inseridos
function updateEditModal(question_id) {
    $('#edit-add-axis-span').hide();
    $('#edit-add-subaxis-span').hide();
    $("#delete-axis").show();
    $("#delete-subaxis").show();
    var question = null;
    $.ajax({
        url: "http://127.0.0.1:1234/questions",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (parseInt(question_id) === parseInt(element['id'])) {
                    question = element;
                }
            })
        }

    })
    let axes = getAxes();
    axes.forEach(axis => {
        document.getElementById('edit-axis-dropdown').innerHTML += `<option value = "${axis['name']}" > ${axis['name']}</option> `
    })
    $('#edit-axis-dropdown').val(getAxisFromId(question['axis_id']));
    let subdivisions = getSubdivisionsFromAxisId((question['axis_id']));
    subdivisions.forEach(subdivision => {
        document.getElementById('edit-critical-factors').innerHTML += `<option value = "${subdivision['name']}" > ${subdivision['name']}</option> `
    })
    $("#edit-question").val(question['text']);
    $("#edit-weight").val(question['weight']);

    for (let i = 1; i <= 5; i++) {
        $('#edit-alternative' + i).val('');
        $('#edit-alternativeweight' + i).val('');
    }

    alternatives = getAlternatives(question['id']);
    let current_count = 1
    alternatives.forEach(alternative => {
        $('#edit-alternative' + current_count).val(alternative['text']);
        $('#edit-alternativeweight' + current_count).val(alternative['weight']);
        current_count++;
    })
    let buttonFunction = `saveQuestionChanges(${question_id})`;
    $("#save-button").attr("onclick", buttonFunction);
}

// Função que retorna o nome do seu subeixos de acordo com o seu id  
function getSubaxisFromId(id) {
    let subaxisName = '';
    $.ajax({
        url: "http://127.0.0.1:1234/axissubdivisions",
        type: 'GET',
        async: false,
        success: data => {
            data.forEach(element => {
                if (parseInt(id) === parseInt(element['id'])) {
                    subaxisName = element;
                }
            })
        }

    })
    return subaxisName;
}

