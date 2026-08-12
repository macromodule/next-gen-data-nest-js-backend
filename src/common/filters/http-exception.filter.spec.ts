import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  const createMockHost = () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const responseMock = { status: statusMock };
    const requestMock = { url: '/api/v1/users', method: 'GET' };

    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(responseMock),
        getRequest: jest.fn().mockReturnValue(requestMock),
      }),
    } as unknown as ArgumentsHost;

    return { host, statusMock, jsonMock, requestMock };
  };

  it('should format HttpException correctly', () => {
    const { host, statusMock, jsonMock } = createMockHost();
    const exception = new HttpException('Resource not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        path: '/api/v1/users',
        method: 'GET',
        message: 'Resource not found',
      }),
    );
  });

  it('should handle validation pipe error arrays', () => {
    const { host, statusMock, jsonMock } = createMockHost();
    const validationErrors = ['email must be an email', 'name should not be empty'];
    const exception = new HttpException(
      { message: validationErrors, error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Validation failed',
        errors: validationErrors,
      }),
    );
  });

  it('should handle generic unhandled exceptions as 500', () => {
    const { host, statusMock, jsonMock } = createMockHost();
    const exception = new Error('Database connection crashed');

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Database connection crashed',
      }),
    );
  });
});
