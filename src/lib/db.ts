import { createDatabase } from 'db0';
import { createStorage } from 'unstorage';
import dbDriver from 'unstorage/drivers/db0';
import libSql from 'db0/connectors/libsql/web';
import { LIBSQL_URL, LIBSQL_TOKEN } from '$env/static/private';

export const db = createDatabase(libSql({ url: LIBSQL_URL, authToken: LIBSQL_TOKEN }));

export const vrcKV = createStorage({
	driver: dbDriver({
		database: db,
		tableName: 'vrc'
	})
});
