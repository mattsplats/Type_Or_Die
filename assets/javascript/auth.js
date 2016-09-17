let user;

const config = {
  apiKey: "AIzaSyBY7pBTCXioihyhFQJ_DKYlqfFPOzMK14M",
  authDomain: "typing-game-e0909.firebaseapp.com",
  databaseURL: "https://typing-game-e0909.firebaseio.com",
  storageBucket: "typing-game-e0909.appspot.com",
  messagingSenderId: "655499981688"
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