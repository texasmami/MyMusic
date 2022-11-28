//-------------------------------//
//          DEPENDENCEIS        //
//-------------------------------//
const express = require('express');
const router = express.Router();
const Post = require('../models/postschema.js');
const Author = require('../models/authors.js');
const UserModel = require('../models/user.js')




//prevent pplp who ar not logged in from getting to restricted pages
const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect('/')
    }
}


//-------------------------------//
//              ROUTES           //
//-------------------------------//

//-------------NEW-REVIEW--------------//
router.get('/user/:userId/new', isAuth, (req, res)=>{
    
        UserModel.findById(req.params.userId, (err, foundUser)=> {
            Author.find({}, (err, allAuthors)=>{
            res.render('new.ejs', {
                authors: allAuthors,
                user: foundUser
            });
        })
        
    });
});

//-------------INDEX-OF REVIEWS--------------//
router.get('/user/:userId',  isAuth, (req, res)=>{
    UserModel.findById(req.params.userId, (err,foundUser)=> {
        Post.find({}, (err, foundPosts)=>{
            res.render('index.ejs', {
                post: foundPosts,
                user:foundUser
            });
        })
    })
	
});

//-------------SHOW-REVIEW--------------//


router.get('/user/:userId/posts/:postId', isAuth, (req, res)=>{
    UserModel.findById(req.params.userId, (err, foundUser)=>{
        Post.findById(req.params.postId, (err, foundMusic)=>{
            console.log(foundMusic);
            UserModel.findOne({'articles._id':req.params.postId}, (err, foundAuthor)=>{
        console.log(foundAuthor + 'found author');
    
                res.render('show.ejs', {
                    
                    music: foundMusic,
                    user:foundUser,
                    author: foundAuthor,
                });
          
        })
        });
    })
   
});


//-------------POST--NEW-REVIEW-------------//


router.post('/user/:userId', (req, res)=>{
    req.body.tags =req.body.tags.split(',')
    
    UserModel.findById(req.params.userId, (err, foundUser)=>{
        Post.create(req.body, (err, createdPost)=>{ //req.body.UserId is ignored due to Schema
            foundUser.articles.push(createdPost);
            foundUser.save((err, data)=>{
                res.redirect('/myMusic/user/' +req.params.userId);
                
            });
        });
    });
});

//-------------EDIT--REVIEW-------------//


router.get('/user/:userId/posts/:postId/edit', isAuth, (req, res)=>{
	Post.findById(req.params.postId, (err, foundPost)=>{
		UserModel.findById(req.params.userId, (err, foundUser)=> {
            UserModel.findOne({'articles._id':req.params.id}, (err, foundPostAuthor)=>{
				res.render('edit.ejs', {
					music: foundPost,
					user: foundUser,
					author: foundPostAuthor
				});
			
		});
        })
			
	});
});



//------COMMENTS ROUTE--------//
router.put('/user/:userId/posts/:postId/comments', (req, res)=> {
    console.log(req.body);
    Post.findByIdAndUpdate(req.params.postId, req.body, {new:true}, (err, updatedMusic)=> {
        console.log(updatedMusic);
        updatedMusic.comments.push({user: req.body.user, comment: req.body.comment})
        updatedMusic.save((err, savedUpdatedMusic)=> {
            console.log(savedUpdatedMusic);
        res.redirect('/myMusic/user/'+req.params.userId+'/posts/'+req.params.postId)
        })
       
    })
})


//------SHOW PROFILE PAGE ROUTE--------//

router.get('/profile/users/:userId', isAuth, (req, res)=>{
	UserModel.findById(req.params.userId, (err, foundUser)=> {
		console.log(foundUser);
        console.log(foundUser);
		res.render('users/profile.ejs',
		{
			user:foundUser
		}
		)
	})
	
})

//------EDIT PROFILE PAGE ROUTE--------//

router.get('/profile/users/:userId/edit', isAuth, (req,res)=> {
	UserModel.findById(req.params.userId, (err, foundUser)=> {
		console.log(foundUser);
		res.render('users/edit.ejs', 
			{
				user:foundUser
			}
		)
	})
})
//------EDIT--PUT PROFILE PAGE ROUTE--------//

router.put('/profile/users/:userId', isAuth, (req, res)=> {
    UserModel.findByIdAndUpdate(req.params.userId, req.body, {new:true}, (err, updatedUser)=> {
        console.log(updatedUser);
        res.render('users/profile.ejs', 
            {
                user:updatedUser
            }
        )
    })
})

//-------------PUT-REVIEW- ROUTE-------------//

router.put('/user/:userId/posts/:postId', (req, res)=>{
   console.log(req.body);
   console.log(req.params);
   
   req.body.tags =req.body.tags.split(',')
        Post.findByIdAndUpdate(req.params.postId, req.body, { new: true }, (err, updatedPost)=>{
            

            UserModel.findOne({ 'articles._id' : req.params.postId }, (err, foundAuthor)=>{
console.log(foundAuthor);
            // if(foundAuthor._id.toString() !== req.body.authorId){
            //     foundAuthor.articles.id(req.params.id).remove();
            //     foundAuthor.save((err, savedFoundAuthor)=>{
            //         Author.findById(req.body.authorId, (err, newAuthor)=>{
            //             newAuthor.articles.push(updatedPost);
            //             newAuthor.save((err, savedNewAuthor)=>{
            //                         res.redirect('/myMusic/user/:userId');
            //             });
            //         });
            //     });
            // } else {
                foundAuthor.articles.id(req.params.postId).remove();

/////need t keep the author info!!!! otherwise all author info removed when u delete

                foundAuthor.articles.push(updatedPost);
                foundAuthor.save((err, data)=>{
    UserModel.findById(req.params.userId, (err, foundUser)=> {

                            res.redirect('/myMusic/user/'+req.params.userId,
                            // {
                            //     user: foundUser
                            // }
                            );
                });
            })
            });
        });
    })
    


//-------------search---------------//
router.post('/search', (req, res)=> {
    console.log(req.body.searchTerm);
    x =req.body.searchTerm;
    console.log(x);
    Post.find(
        {$or: [
        {
            artist: 
            {$regex:x, $options:'i'}
            // {$regex:/x/i, }          
        },
        {
            album:
            // {$regex:/x/i, }          

            {$regex:x, $options:'i'}
        },
        {
            tags: 
            {$regex:x, $options:'i'} 
            // {$regex:/x/i, }          

                       
        },

    ]
        
    }, 
    (err, foundPosts)=> {
        res.render('search.ejs',
            {
                post: foundPosts
            }
        )
    })
})

//-------------DELETE---------------//

router.delete('/user/:userId/posts/:postId', (req, res)=>{
    Post.findByIdAndRemove(req.params.id, (err, foundPost)=>{
        Author.findOne({'articles._id':req.params.id}, (err, foundAuthor)=>{
            foundAuthor.articles.id(req.params.id).remove();
            foundAuthor.save((err, data)=>{
                res.redirect('/myMusic');
            });
        });
    });
});



//how to  make work for myMusic/foo
//error message for page that does not exist
// router.use((req,res, next)=> {
//     res.send('404 page not found')
// })

//-------------------------------//
//              EXPORTS           //
//-------------------------------//
module.exports = router


//-------------------------------//
//             GRAVEYARD         //
//-------------------------------//

//-------------NEW POST---------------//
// router.get('/new', (req, res)=> {
//     res.render('new.ejs')
// })

//-------------INDEX POSTS---------------//
// router.get('/', (req, res)=>{
// 	Post.find({}, (err, allPosts)=> {
//         res.render('index.ejs',
//             {
//                 post: allPosts
//             }
//         );
//     })
    
// })

//-------------SHOW-POST--------------//
// router.get('/:id', (req,res)=> {
//     Post.findById(req.params.id,  (err, foundMusic)=> {
   
//         res.render('show.ejs',
//         {
//             music : foundMusic,
            
//         }
//         )
//     })
// })
// router.get('/user/:userId/posts/:postId', isAuth, (req, res)=>{
//     console.log(req.body);
//     console.log(req.params.userId +"req.params");
//     console.log(req.params.postId);
//     Post.findById(req.params.postId, (err, foundMusic)=>{
//         console.log(foundMusic);
//         Author.findOne({'articles._id':req.params.postId}, (err, foundAuthor)=>{
//      UserModel.findOne({_id: req.params.userId}, (err, foundUser)=> {

//             res.render('show.ejs', {
//                 author:foundAuthor,
//                 music: foundMusic,
//                 user:foundUser
//             });
//         })
//     })
//     });
// });

//-------------POST--NEW-REVIEW-------------//
// router.post('/', (req, res)=> {
//     Post.create(req.body, (err, createdPost)=> {
//         res.redirect('/myMusic')
//     })
// })
// router.post('/', (req, res)=>{
//     req.body.tags =req.body.tags.split(',')
//     Author.findById(req.body.authorId, (err, foundAuthor)=>{
//         Post.create(req.body, (err, createdPost)=>{ //req.body.authorId is ignored due to Schema
//             foundAuthor.articles.push(createdPost);
//             foundAuthor.save((err, data)=>{
//                 res.redirect('/myMusic');
//             });
//         });
//     });
// });

//-------------EDIT--REVIEW-------------//
// router.get('/:id/edit', (req,res)=> {
//     Post.findById(req.params.id, (err, foundMusic)=> {
//         res.render('edit.ejs',
//             {
//                 music: foundMusic
//             }
//         )
//     })
// })

//-------------DELETE---------------//
// router.delete('/:id', (req, res)=> {
//     Post.findByIdAndRemove(req.params.id, (err, deletedMusic)=> {
//         res.redirect('/myMusic')
//     })
// })