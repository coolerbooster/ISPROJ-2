import { UserModel } from '../models/UserModel';

export const AuthController = {
    login: (username, password) => {
        return UserModel.validateUser(username, password);
    }
}; 