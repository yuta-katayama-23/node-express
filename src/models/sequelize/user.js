import { Sequelize, Model } from 'sequelize';
import { DateTime } from 'luxon';
import bcrypt from 'bcrypt';
import NumberCryptoDecrypto from '../../lib/number-crypto-decrypto';

const encrypt = (v) => bcrypt.hashSync(v, 10);
const numberCryptoDecrypto = new NumberCryptoDecrypto();

export default class User extends Model {
	static init(sequelize, DataTypes) {
		return super.init(
			{
				id: {
					allowNull: false,
					autoIncrement: true,
					primaryKey: true,
					type: DataTypes.INTEGER.UNSIGNED
				},
				email: {
					type: DataTypes.STRING(128),
					allowNull: false,
					unique: 'idx_email',
					validate: { isEmail: true }
				},
				password: {
					type: DataTypes.CHAR(60),
					allowNull: false,
					set(v) {
						this.setDataValue('password', encrypt(v));
					}
				},
				fullName: {
					type: DataTypes.STRING(128),
					allowNull: true,
					field: 'full_name'
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
					get() {
						return DateTime.fromJSDate(
							this.getDataValue('createdAt')
						).toUnixInteger();
					},
					field: 'created_at'
				},
				updatedAt: {
					allowNull: false,
					type: 'TIMESTAMP',
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
					get() {
						return DateTime.fromJSDate(
							this.getDataValue('updatedAt')
						).toUnixInteger();
					},
					field: 'updated_at'
				},
				userId: {
					type: DataTypes.VIRTUAL,
					get() {
						return numberCryptoDecrypto.encrypting(this.getDataValue('id'));
					},
					set(v) {
						this.setDataValue('id', numberCryptoDecrypto.decrypting(v));
					}
				}
			},
			{
				sequelize,
				tableName: 'users',
				modelName: 'user',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'id' }]
					},
					{
						name: 'idx_email',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'email' }]
					}
				]
			}
		);
	}

	static findByUserId(userId, options = {}) {
		if (!userId) throw new Error('userId must be required');

		const id = numberCryptoDecrypto.decrypting(userId);
		if (!id) return null;

		return this.findByPk(id, options);
	}

	toJSON(options = {}) {
		const json = super.toJSON();
		if (options.exclude && Array.isArray(options.exclude))
			options.exclude.forEach((key) => delete json[key]);
		return json;
	}
}
