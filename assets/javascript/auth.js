let user;

// Initialize Firebase
const config = {
  apiKey: "AIzaSyDM9yXN5XfGo_atATfz8E9eoJpBM84o9sE",
  authDomain: "typinggame-5649e.firebaseapp.com",
  databaseURL: "https://typinggame-5649e.firebaseio.com",
  storageBucket: "typinggame-5649e.appspot.com",
  messagingSenderId: "271779327937"
};
firebase.initializeApp(config);

$("#auth").on('click', function() {
  // First, we perform the signInWithRedirect.
  // Creates the provider object.
  var auth = firebase.auth()
  var provider = new firebase.auth.GoogleAuthProvider();

  // You can add additional scopes to the provider:
  provider.addScope('email');

  // Sign in with redirect:
  auth.signInWithPopup(provider).then(function(result) {
    // The firebase.User instance:
    user = result.user;
    console.log(user);
    
  }, function(error) {
    throw error;
  });
});

// $(document).on('click', 'button', function() {
// var user = $(this).data('user')
// var queryURL = "https://developer.github.com/v3/search/#search-users"

// $.ajax({
//                 url: queryURL,
//                 method: 'GET'
//             })
//             .done(function(response) {
//                 var results = response.data;
//                 console.log(results)