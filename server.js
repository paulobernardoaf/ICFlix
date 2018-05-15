const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhttp = new XMLHttpRequest();
var ObjectID = require('mongodb').ObjectID

var PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(bodyParser.json())

var db

MongoClient.connect('mongodb://admin:admin123@ds113871.mlab.com:13871/paulo-bernardo-database', function (err, database) {
    if (err) return console.log(err)
    db = database
    app.listen(3000, function () {
        console.log('listening on' + PORT)
    })
});

//===================== MOVIE ======================//

// GET /movies => retorna a lista de todos os filmes

app.get('/movies', function(req, res) {
    db.collection('movies').find().toArray( function(err, result) {
        if (err) return console.log(err)
        console.log('GET /movies realizado com êxito');
        res.json({movies: result});
    });
});

// GET /movies/:id => retorna o filme identificado pelo ':id'

app.get('/movies/:id', function(req, res) {
    db.collection('movies').findOne({_id: ObjectID(req.params.id)}, function(err, result) {
        if (err) return console.log(err)
        console.log('GET /movies/:id realizado com êxito');
        res.json({movies: result});
    });
});

// POST /movies => cria um novo filme

app.post('/movies', function(req, res) { 
    db.collection('movies').save(req.body, function(err, result) {
        if(err) console.log(err);
        console.log(req.body);
        console.log('POST /movies realizado com êxito');
        res.json(req.body);
    })
})

// PUT /movies/:id => atualiza o filme identificado pelo ':id'

app.put('/movies/:id', function(req, res) {
    db.collection('movies').findOneAndUpdate({_id: ObjectID(req.params.id)}, {
        $set: {
            nome: req.body.nome,
            descricao: req.body.descricao,
            avaliacao: req.body.avaliacao, 
            trailer: req.body.trailer,
            imagem: req.body.imagem,
            imagem2: req.body.imagem2
        }
      }, function(err, result) {
          if(err) console.log(err)
          console.log('PUT /movies/:id realizado com êxito');
          console.log(req.body);
          console.log(result);
          res.redirect('/movies')
    })
})

// PUT /movies/:id/addCategory/:idCategory => associa o filme identificado pelo ':id' à categoria identificada pelo ':idCategory'

app.put('/movies/:id/addCategory/:idCategory', function(req, res) {
    db.collection('movies').findOne({_id: ObjectID(req.params.id)}, function(err, movie) { 
        if (err) console.log(err);
        db.collection('categories').findOneAndUpdate({_id: ObjectID(req.params.idCategory)}, {
            $addToSet: {
                filmes: movie._id 
              }
            }, function(err, result) {
                if (err) console.log(err);
            })

            db.collection('categories').findOne({_id: ObjectID(req.params.idCategory)}, function(err, categorie) {
                if(err) console.log(err);

                db.collection('movies').findOneAndUpdate({_id: ObjectID(req.params.id)}, {
                    $addToSet: {
                        categorias: categorie._id     
                    }
                }, function(err, result) {
                    if(err) console.log(err);
                    res.json({message: 'FOI'})
                })
            })
        })
    })  

// PUT /movies/:id/removeCategory/:idCategory => remove o filme identificado pelo ':id' da categoria identificada pelo ':idCategory'

app.put('/movies/:id/removeCategory/:idCategory', function(req, res) {
    db.collection('categories').findOne({_id: ObjectID(req.params.idCategory)}, function(err, categorie) {
        if (err) console.log(err);
        db.collection('movies').findOneAndUpdate({_id: ObjectID(req.params.id)}, {
            $pull: {
                   categorias: categorie._id
              }
            },function(err, result) {
            if(err) console.log(err);
        })

        db.collection('movies').findOne({_id: ObjectID(req.params.id)}, function(err, movie) {
            if(err) console.log(err)
            db.collection('categories').findOneAndUpdate({_id: ObjectID(req.params.idCategory)}, {
                $pull: {
                    filmes: movie._id
                }
            }, function(err, movie) {
                if (err) console.log(err)
                res.json({message: "foi"})
            })
        })
    })
})

// DELETE /movies/:id - remove um filme identificado pelo ':id'

app.delete('/movies/:id', function(req, res) {
    db.collection('movies').findOneAndDelete({_id: ObjectID(req.params.id)}, 
        function(err, result) {
            if (err) return res.send(500, err)
            console.log('DELETE /movies/:id realizado com êxito');
            res.json({message: "Apagou"})  
        })
        db.collection('categories').update({}, {
            $pull: {
                filmes: {
                    id: ObjectID(req.params.id)}}},
                    {multi: true}),
             function(err, results) {
            if(err) console.log(err)
            console.log(results)
        }
    })

// ============================= CATEGORIES ==============================//

// GET /categories => retorna lista de todos as categorias

app.get('/categories', function(req, res) {
    db.collection('categories').find().toArray(function(err, result) {
        if(err) console.log(err);
        console.log('GET /categories realizado com êxito');
        //res.render('categories.ejs', {categories: result});
        res.json({categories: result});
    })
})

// GET /categories/:id => retorna a categoria identificada pelo ':id'

app.get('/categories/:id', function(req, res) {
    db.collection('categories').findOne({_id: ObjectID(req.params.id)}, function(err, result) {
        if(err) console.log(err);
        console.log('GET /categories/:id realizado com êxito');
        res.json({Nome_da_Categoria: result});
    })
})

// GET /categories/:id/movies => retorna os filmes associados à categoria identificada pelo ':id'

app.get('/categories/:id/movies', function(req, res) {
    db.collection('categories').findOne({_id: ObjectID(req.params.id)}, function(err, categorie) {
        if(err) console.log(err);
        res.json({ID_dos_filmes: categorie.filmes});
    })
})

// POST /categories => cria uma nova categoria

app.post('/categories', function(req, res) { 
    db.collection('categories').save(req.body, function(err, result) {
        if(err) console.log(err);
        console.log(req.body);
        console.log('POST /categories realizado com êxito');
        res.redirect("/gerenciar_categorias")
    })
})

// PUT /categories/:id => atualiza uma categoria identificada pelo ':id'

app.put('/categories/:id', function(req, res) {
    db.collection('categories').findOneAndUpdate({_id: ObjectID(req.params.id)}, {
        $set: {
            name: req.body.name,
            exibir: req.body.exibir
        }
      }, function(err, result) {
          if(err) console.log(err)
          console.log(JSON.stringify(req.body));
          console.log('PUT /categories/:id realizado com êxito');
          res.json({message: "Atualizou"});
    })
})

// DELETE /categories/:id => remove uma categoria identificada pelo ':id'

app.delete('/categories/:id', function(req, res) {
    db.collection('categories').findOneAndDelete({_id: ObjectID(req.params.id)}, 
        function(err, result) {
            if (err) return res.send(500, err)
            console.log('DELETE /categories/:id realizado com êxito');
            res.json({message: "deletou"}); 
        })
        db.collection('movies').update({}, {
                $pull: {
                    categorias: ObjectID(req.params.id)
                }
            }, {
                multi: true
            }),
            function (err, results) {
                if (err) console.log(err)
                console.log(results)
            }
})


// ICFLIX FRONT-END

app.get('/home', function(req, res) {
    db.collection('movies').find().toArray( function(err, result) {
        if(err) console.log(err)
        db.collection('categories').find().toArray( function(err, results) {
            if(err) console.log(err);
            console.log('GET /home');            
            res.render('ICFLIX.ejs', {movies: result, categories: results});
        })
    })
})

app.get('/gerenciar_categorias', function(req, res) {
    db.collection('categories').find().toArray( function(err, result) {
        if (err) console.log(err);
        console.log('GET /gerenciar_categorias');
        res.render('categorias.ejs', {categories: result})
    })
})

app.get('/gerenciar_filmes', function(req, res) {
    db.collection('movies').find().toArray( function(err, result) {
        if (err) console.log(err);
        db.collection('categories').find().toArray( function(err, results) {
            if(err) console.log(err);
            console.log('GET /gerenciar_filmes');
            res.render('filmes.ejs', {movies: result, categories: results})
        })
    })
})

app.get('/novo_filme', function(req, res) {
    db.collection('movies').find().toArray( function(err, result) {
        if (err) console.log(err)
        console.log('GET /novo_filme')
        res.render('novo_filme.ejs')
    })
})

app.get('/nova_categoria', function(req, res) {
    db.collection('categories').find().toArray( function(err, result) {
        if (err) console.log(err)
        console.log('GET /nova_categoria');
        res.render('nova_categoria.ejs')
    })
})

app.get('/addCategorias/:id', function(req, res) {
    db.collection('categories').find().toArray( function(err, result) {
        if(err) console.log(err) 

        db.collection('movies').findOne({_id: ObjectID(req.params.id)}, function(err, movie) {
            if(err) console.log(err)
            console.log(result);
            console.log(movie);
            res.render('addCategories.ejs', {categories: result, movies: movie});
        })
    })
})

app.get('/editMovie/:id', function(req, res) {
    db.collection('movies').findOne({_id: ObjectID(req.params.id)}, function(err, result) {
        if(err) console.log(err)
        console.log('GET /editMovies/:id');
        res.render('editMovie.ejs', {movies: result});
    })
})

app.get('/removeCategorias/:id', function(req, res) {
    db.collection('categories').find().toArray( function(err, result) {
        if(err) console.log(err)
        db.collection('movies').findOne({_id: ObjectID(req.params.id)}, function(err, movie) {
            if(err) console.log(err)
            console.log(result);
            console.log(movie);
            res.render('removeCategories.ejs', {movies: movie, categories: result});
        })
    })
})

app.get('/editCategories/:id', function(req, res) {
    db.collection('categories').findOne({_id: ObjectID(req.params.id)}, function(err, result) {
        if(err) console.log(err)
        console.log('GET /editCategories/:id');
        res.render('editCategories.ejs', {categories: result});
    })
})

app.get('/categoria/:id/filmes', function (req, res) {
    db.collection('categories').findOne({_id: ObjectID(req.params.id)}, function (err, categorie) {
        if (err) console.log(err);
        db.collection('movies').find().toArray( function(err, movie) {
            if(err) console.log(err);
            console.log('GET /categoria/:id/filmes');
            res.render('categoryMovies.ejs', {categories: categorie, movies: movie})
        })
    })
})

app.get('/filme/:id', function(req, res) {
    db.collection('movies').findOne({_id: ObjectID(req.params.id)}, function(err, movie) {
        if(err) console.log(err)
        db.collection('categories').find().toArray( function(err, categories) {
            if(err) console.log(err)
            console.log('GET /filme/:id');
            res.render('oneMovie.ejs', {movies: movie, categories: categories})
        })
    })
})

app.get('/movieIs/:id', function(req, res) {
    db.collection('movies').findOne({_id: ObjectID(req.params.id)}, function(err, movie) {
        if(err) console.log(err)
        db.collection('categories').find().toArray( function(err, categories) {
            if(err) console.log(err)
            console.log('GET /movieIs/:id');
            res.render('movie.ejs', {movies: movie, categories: categories})
        })
    })
})

app.get('/categorieIs/:id/movies', function(req, res) {
    db.collection('categories').findOne({_id: ObjectID(req.params.id)}, function(err, categorie) {
        if(err) console.log(err);
        db.collection('movies').find().toArray( function(err, movies) {
            if(err) console.log(err);
            db.collection('categories').find().toArray( function(err, categorias) {
                if(err) console.log(err)
                console.log('Get /categorieIs/:id/movies');
                res.render('filmesCategoria.ejs', {movies: movies, categories: categorie, categorias: categorias});
            })
        })
    })
})