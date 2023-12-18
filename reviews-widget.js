// reviews-widget.js


let reviewGenerationUrl;
let firstPartyReviewPage;
let averageRating;
let entityName;

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
        .then((reviews) => {
            console.log("Reviews:", reviews);

            // Extract review details
            const reviewDetails = reviews.map((review) => ({
                authorName: review.authorName,
                content: review.content,
                publisher: review.publisher,
                rating: review.rating,
                reviewDate: review.reviewDate,
                comments: review.comments
            }));

            // Calculate the average rating
            const totalRating = reviewDetails.reduce((sum, review) => sum + review.rating, 0);
            averageRating = reviewDetails.length > 0 ? totalRating / reviewDetails.length : 0;

            // Your widget initialization code here, using entity details, reviews data, review URLs, and average rating
            console.log("Review Generation URL:", reviewGenerationUrl);
            console.log("First Party Review Page:", firstPartyReviewPage);
            console.log("Average Rating:", averageRating);

            // Display paginated reviews
            displayReviews(reviewDetails);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function displayReviews(reviewDetails) {
    // Display total count and average rating
    const totalCountElement = document.getElementById('total-count');
    const averageRatingElement = document.getElementById('average-rating');
    const starIconsElement = document.getElementById('star-icons');
    const reviewsContainer = document.getElementById('reviews-container');

    if (reviewDetails.length === 0) {
        // Display a message when there are no reviews
        totalCountElement.textContent = 'Be the first to leave a review!';
        averageRatingElement.textContent = '';
        starIconsElement.innerHTML = '';
    } else {
        // Display total count and average rating
        totalCountElement.textContent = `Total Reviews: ${reviewDetails.length}`;
        averageRatingElement.textContent = `Average Rating: ${averageRating.toFixed(2)}`;
        starIconsElement.innerHTML = getStarIcons(averageRating);

        // Display paginated reviews
        const reviewsPerPage = 5;

        for (let i = 0; i < reviewDetails.length; i += reviewsPerPage) {
            const pageReviews = reviewDetails.slice(i, i + reviewsPerPage);
            const pageElement = createReviewPageElement(pageReviews);
            reviewsContainer.appendChild(pageElement);
        }
    }
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
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
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
                    ${review.content ? `<p><strong>Content:</strong> ${review.content}</p>` : ''}
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

    const starIcons = '&#9733;'.repeat(fullStars) +
        (halfStars === 0.5 ? '&#9732;' : '') +
        '&#9734;'.repeat(emptyStars);

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
