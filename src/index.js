import 'source-map-support/register';
import express, { Router } from 'express';
import openapiValidator from './middleware/custome-openapi-validator';
import errorResponse from './middleware/error-response';
import CustomError from './middleware/custom-error';

const app = express();
const router = Router();

app.use(express.json());
app.use(errorResponse());
app.use(openapiValidator('/api/v1/user'));

app.use('/api/v1', router);

router.get('/', (req, res) => {
	try {
		throw new CustomError(409, 'Already exits');
	} catch (error) {
		res.error(error);
	}
});

router.get('/user/:userid', (req, res) => {
	res
		.status(200)
		.json({ id: 1, email: 'sample@example.com', createdAt: 111111 });
});

router.post('/user', (req, res) => {
	res.status(200).json({ id: 1, ...req.body, createdAt: 111111 });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	res.error(err);
});
app.listen(3000, () => console.log('listening on port 3000!'));
