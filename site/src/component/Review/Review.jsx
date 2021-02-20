import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SubReview from "./SubReview";
import './Review.scss'

var DUMMY_DATA = [
    {
        takenWith: "Richard Pattis",
        quarterTaken: "Spring 2020",
        gradeReceived: "A",
        quality: 4,
        difficulty: 3,
        content: `In Korea, heart surgeon. Number one. 
            Steady hand. One day, Kim Jong Un need new heart. 
            I do operation. But mistake! Kim Jong Un die! SSD 
            very mad! I hide fishing boat, come to America. No 
            English, no food, no money. Darryl give me job. Now 
            I have house, American car and new woman. Darryl save life.`,
        score: 20
    },
    {
        takenWith: "Alex Thornton",
        quarterTaken: "Fall 2020",
        gradeReceived: "A",
        quality: 5,
        difficulty: 1,
        content: `Thornton actually TEACHES. Always accessible. I attended 
        class AND read & took notes from online lecture. This class asks for 
        a lot but it is damn worth it. I feel much more confident in my ability 
        to solve problems. Those projects can be crazy fun & hard. Midterm was 2x 
        harder than the final. Aim to be above the average scores.`,
        score: 124
    }
]

export default function Review(props) {
    console.log(props);
    const [reviewData, setReviewData] = useState(null);

    const getReviews = async () => {
        const res = await axios.get('/reviews');
        setReviewData(res.data.data.allReviews.data);
    }

    useEffect(() => {
        getReviews();
    }, [])

    // TODO: connect with backend api and query database

    if (!reviewData) {
        return <p>Loading reviews..</p>;
    } else {
        return (
            <div className="reviews">
                {reviewData.map((review, i) => {
                    if (review !== null) return (<SubReview review={review} key={i}/>)
                })}
                <button type="button" className="add-review-btn">+ Add Review</button>
            </div>
        )

    }
}