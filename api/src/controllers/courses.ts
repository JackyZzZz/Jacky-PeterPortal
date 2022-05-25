/**
 @module CoursesRoute
*/

import express, { Request } from 'express';
import fetch from 'node-fetch';
import { GenericObject } from '../types/types';
import courseDummy from '../dummy/course.json';
import {getCourseQuery} from '../helpers/gql';
var router = express.Router();

/**
 * Elasticsearch proxy for courses index
 */
router.post('/_search', function (req, res, next) {
  if (!process.env.PETERPORTAL_MAIN_ES) {
    res.json(courseDummy);
    return;
  }
  let r = fetch(process.env.PETERPORTAL_MAIN_ES + 'courses/_search',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    })

  r.then((response) => response.json())
    .then((data) => res.send(data))
    .catch(err => console.log('Error:', err))
});

/**
 * PPAPI proxy for course data 
 */
router.get('/api', (req: Request<{}, {}, {}, { courseID: string }>, res) => {
  let r = fetch(process.env.PUBLIC_API_URL + 'courses/' + encodeURIComponent(req.query.courseID), {
    headers: {
      'x-api-key': process.env.PPAPI_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  console.log(req.query.courseID)

  r.then((response) => response.json())
    .then((data) => res.send(data))
});

/**
 * PPAPI proxy for course data 
 */
router.post('/api/batch', (req: Request<{}, {}, { courses: string[] }>, res) => {
  if (req.body.courses.length == 0) {
    res.json({});
  }
  else {
    let r = fetch(process.env.PUBLIC_API_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: getCourseQuery(req.body.courses)
      })
    });

    r.then((response) => response.json())
      .then((data) => res.json(data.data))
  }
});

/**
 * PPAPI proxy for grade distribution
 */
router.get('/api/grades',
  (req: Request<{}, {}, {}, { department: string; number: string; }>, res) => {
    let r = fetch(process.env.PUBLIC_API_URL + 'grades/raw?department=' + encodeURIComponent(req.query.department) + '&number=' + req.query.number, {
      headers: {
        'x-api-key': process.env.PPAPI_KEY
      }
    });

    r.then((response) => response.json())
      .then((data) => res.send(data))
  });

export default router;