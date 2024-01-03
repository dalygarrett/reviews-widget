// reviews-widget.js

let reviewGenerationUrl;
let firstPartyReviewPage;
let averageRating;
let entityName;
let reviews = []; // Declare reviews in the outer scope


function initWidget(config) {
    // Extract the entity ID from the configuration
    const entityId = config.entityId;

    // Make the first API call to retrieve entity details
    fetchEntityDetails(entityId)
        .then((entityDetails) => {
            console.log("Entity Details:", entityDetails);

            // Store review generation URLs
            reviewGenerationUrl = entityDetails.response.reviewGenerationUrl;
            firstPartyReviewPage = entityDetails.response.firstPartyReviewPage;

            // Extract entity name
            entityName = entityDetails.response.name;

            // Make the second API call to retrieve reviews using the obtained entity ID
            return fetchReviews(entityId);
        })
        .then((fetchedReviews) => {
            console.log("Reviews:", fetchedReviews);

            // Update the reviews variable with the fetched reviews
            reviews = fetchedReviews;

            // Extract review details
            const reviewDetails = reviews.map((review) => ({
                authorName: review.authorName,
                content: review.content,
                publisher: review.publisher,
                rating: review.rating,
                reviewDate: review.reviewDate,
                comments: review.comments,
            }));

            // Calculate the average rating
            const totalRating = reviewDetails.reduce((sum, review) => sum + review.rating, 0);
            averageRating = reviewDetails.length > 0 ? totalRating / reviewDetails.length : 0;

            // Your widget initialization code here, using entity details, reviews data, review URLs, and average rating
            console.log("Review Generation URL:", reviewGenerationUrl);
            console.log("First Party Review Page:", firstPartyReviewPage);
            console.log("Average Rating:", averageRating);

            // Display paginated reviews
            displayReviews();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function displayReviews() {
    // Display total count and average rating
    // Display total count and average rating
    const totalCountElement = document.getElementById("total-count");
    const averageRatingElement = document.getElementById("average-rating");
    const starIconsElement = document.getElementById("star-icons");
    const reviewsContainer = document.getElementById("reviews-container");
    const paginationContainer = document.getElementById("pagination-container");

    if (!Array.isArray(reviews) || reviews.length === 0) {
        totalCountElement.innerHTML = "<h2>Be the first to leave a review!</h2>";
        averageRatingElement.textContent = "";
        starIconsElement.innerHTML = "";
        reviewsContainer.innerHTML = ""; // Clear reviews container
        paginationContainer.innerHTML = ""; // Clear pagination container
        return;
    }

    // Calculate the average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Display total count and average rating
    totalCountElement.textContent = `Total Reviews: ${reviews.length}`;
    averageRatingElement.textContent = `Average Rating: ${averageRating.toFixed(2)}`;
    starIconsElement.innerHTML = getStarIcons(averageRating);

    // Display paginated reviews
    const reviewsPerPage = 5;
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    // Clear existing content
    reviewsContainer.innerHTML = "";
    paginationContainer.innerHTML = "";

    // Display only the first page or the most recent 5 reviews
    const initialPageReviews = reviews.slice(0, reviewsPerPage);
    const pageElement = createReviewPageElement(initialPageReviews);
    reviewsContainer.appendChild(pageElement);

    // Display pagination controls
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.classList.add("pagination-button");
        button.addEventListener("click", () => paginate(i, reviewsPerPage));
        paginationContainer.appendChild(button);
    }

}

function paginate(currentPage, reviewsPerPage) {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const pageReviews = reviews.slice(startIndex, endIndex);
    const reviewsContainer = document.getElementById("reviews-container");
    reviewsContainer.innerHTML = ""; // Clear reviews container
    const pageElement = createReviewPageElement(pageReviews);
    reviewsContainer.appendChild(pageElement);
}

function updatePaginationControls(totalPages) {
    const paginationContainer = document.getElementById('pagination-container');
    
    // Clear existing pagination controls
    paginationContainer.innerHTML = '';

    // Create left arrow button
    const leftArrow = document.createElement('button');
    leftArrow.textContent = '←';
    leftArrow.addEventListener('click', () => navigatePage(-1));
    paginationContainer.appendChild(leftArrow);

    // Create page number buttons
    for (let i = 0; i < totalPages; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.textContent = i + 1;
        pageNumber.addEventListener('click', () => navigatePage(i));
        paginationContainer.appendChild(pageNumber);
    }

    // Create right arrow button
    const rightArrow = document.createElement('button');
    rightArrow.textContent = '→';
    rightArrow.addEventListener('click', () => navigatePage(1));
    paginationContainer.appendChild(rightArrow);
}

function navigatePage(offset) {
    // Update the current page index
    currentPageIndex = Math.max(0, Math.min(currentPageIndex + offset, totalPages - 1));

    // Redisplay reviews for the current page
    displayReviews(reviewDetails);
}

function createReviewPageElement(reviews) {
    const pageElement = document.createElement('div');

    reviews.forEach((review) => {
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('review');

        // Log the raw reviewDate string
        console.log("Raw reviewDate:", review.reviewDate);

        // Determine the publisher icon based on the publisher value
        let publisherIcon = '';
        switch (review.publisher) {
            case 'GOOGLEMYBUSINESS':
                publisherIcon = 'https://www.yext-static.com/cms/spark/1/site-icon-250.svg';
                break;
            case 'FIRSTPARTY':
                publisherIcon = 'https://www.yext-static.com/cms/spark/1/site-icon-283.svg';
                break;
            case 'FACEBOOK':
                publisherIcon = 'https://www.yext-static.com/cms/spark/1/site-icon-71.svg';
                break;
            // Add more cases for other publishers if needed
            default:
                publisherIcon = ''; // Default to empty if no matching publisher
        }

        const formattedReviewDate = review.reviewDate
            ? new Date(review.reviewDate).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                //   hour: 'numeric',
                //   minute: 'numeric',
                //   second: 'numeric',
              })
            : 'Date Not Available';

        // Log the formatted reviewDate
        console.log("Formatted reviewDate:", formattedReviewDate);

        // Display review details (publisher, author, rating, content)
        reviewElement.innerHTML = `
            <div class="review-details">
                <img class="publisher-icon" src="${publisherIcon}" alt="${review.publisher}">
                <div class="details-right">
                    <p><strong>Date:</strong> ${formattedReviewDate}</p>
                    <p><strong>Author:</strong> ${review.authorName}</p>
                    <p><strong>Rating:</strong> ${getStarIcons(review.rating)}</p>
                    ${review.content ? `<p><strong>Review:</strong> ${review.content}</p>` : ''}
                </div>
            </div>
        `;

        pageElement.appendChild(reviewElement);

        const commentElement = createCommentHTML(review.comments, entityName);
        if (commentElement) {
            // Add a slight indent for comments to distinguish them as responses
            pageElement.appendChild(commentElement);
        }
    });

    return pageElement;
}

function createCommentHTML(comments, entityName) {
    if (!comments || comments.length === 0) {
        return null;
    }

    // Display comments as nested elements
    const commentSection = document.createElement('div');
    commentSection.classList.add('comment-section');

    comments.forEach((comment) => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
            <p><strong>Date:</strong> ${new Date(comment.commentDate).toLocaleString()}</p>
            <p><strong>${entityName}:</strong> ${comment.content}</p>
        `;
        commentSection.appendChild(commentElement);
    });

    return commentSection;
}

function getStarIcons(rating) {
    const starCount = 5;
    const fullStars = Math.floor(rating);
    const halfStars = Math.round((rating % 1) * 2) / 2;
    const emptyStars = starCount - fullStars - halfStars;

    const starIcons = '<span class="star">&#9733;</span>'.repeat(fullStars) +
        (halfStars === 0.5 ? '<span class="star half">&#9733;</span>' : '') +
        '<span class="star empty">&#9734;</span>'.repeat(emptyStars);

    return starIcons;
}


function fetchEntityDetails(entityId) {
    console.log('Fetching entity details...');
    const apiKey = "99129b94608fd8beb48863bbf601a569";
    const apiUrl = `https://corsproxy.io/?https://cdn.yextapis.com/v2/accounts/me/entities/${entityId}?api_key=${apiKey}&v=20231030`;

    return fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch entity details: ${response.statusText}`);
            }
            return response.json();
        });
}

function fetchReviews(entityId) {
    console.log('Fetching reviews...');
    const apiKey = "99129b94608fd8beb48863bbf601a569";
    const apiUrl = `https://cdn.yextapis.com/v2/accounts/me/content/reviews?api_key=${apiKey}&v=20231019&entity.id=${entityId}`;

    return fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch reviews: ${response.statusText}`);
            }
            return response.json();
        })
        .then((reviews) => {
            // Check if the response or docs property is undefined or null
            const docs = reviews?.response?.docs;
            
            // If docs is undefined or null or an empty array, return an empty array
            return Array.isArray(docs) ? docs : [];
        });
}

document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for the review generation button
    const reviewGenerationButton = document.getElementById('review-generation-button');
    reviewGenerationButton.addEventListener('click', function () {
        // Open the review generation link in a new tab
        window.open(reviewGenerationUrl, '_blank');
    });
});
