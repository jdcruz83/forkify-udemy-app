import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
// import { async } from 'regenerator-runtime';

// import icons from '../img/icons.svg'; // Parcel 1.*
// import icons from 'url:../img/icons.svg'; // Parcel 2.*

// if(module.hot) {
//     module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

// === List of functionalities that can be added later! ===
// TODO: Display number of pages
// TODO: Sort search results by duration or number of ingredients
// TODO: Perform ingredient validation
// TODO: Improve recipe ingredient input: multiple fields and mora than 6 ingredients
// TODO: Shopping list feature
// TODO: Weekly meal planning feature: Assign to the next 7 days and show on weekly calendar
// TODO: Get nutrition data on each ingredient;

///////////////////////////////////////
const controlRecipes = async function () {
    try {
        const id = window.location.hash.slice(1);

        if (!id) return;
        recipeView.renderSpinner();

        // Update results view to mark selected search result
        resultsView.update(model.getSearchResultsPage());

        // Updating bookmarks view
        bookmarksView.update(model.state.bookmarks);

        // 1) Loading recipe
        await model.loadRecipe(id);
        const { recipe } = model.state;

        // 2) Rendering recipe
        recipeView.render(model.state.recipe);
    } catch (err) {
        recipeView.renderError();
        console.error(err);
    }
};

const controlSearchResults = async function () {
    try {
        resultsView.renderSpinner();
        // Get search query
        const query = searchView.getQuery();
        if (!query) return;

        // Load search results
        await model.loadSearchResults(query);

        // Render results
        resultsView.render(model.getSearchResultsPage());

        // Render the initial pagination buttons
        paginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function (goToPage) {
    // Render NEW results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // Render NEW pagination buttons
    paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
    // Update the recipe servings (in state)
    model.updateServings(newServings);

    // Update the recipe view
    // recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);
};

const controlAddbookmark = function () {
    // Add or Remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // Update recipe view
    recipeView.update(model.state.recipe);

    // Render bookmarks
    bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
    bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
    try {
        // Show loading spinner to user
        addRecipeView.renderSpinner();

        // Upload the new recipe data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // Render recipe
        recipeView.render(model.state.recipe);

        // Success message display
        addRecipeView.renderMessage();

        // Render boolmark view
        bookmarksView.render(model.state.bookmarks);

        // Change ID in our URL
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // HINT: window.history.back() -> going back to the last page //

        // Close form window
        setTimeout(function () {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error('😎', err);
        addRecipeView.renderError(err.message);
    }
};

const init = function () {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddbookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();

// // TEST
// controlServings();
