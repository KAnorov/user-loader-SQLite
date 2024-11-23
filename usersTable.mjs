import DatabaseSync from 'better-sqlite3';

const
    database = new DatabaseSync('./db.sqlite'),
    URL_ADD = 'https://jsonplaceholder.typicode.com/users';

database.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        username TEXT,
        email TEXT,
        phone TEXT,
        website TEXT
    )
`);

async function getUsers() {
    const
        response = await fetch(URL_ADD),
        data = await response.json();
    return data;
}

function addUsers(users) {
    const
        insert = database.prepare(`INSERT INTO users (id, name, username, email, phone, website) values(?, ?, ?, ?, ?, ?)`),
        selectUser = database.prepare('SELECT COUNT(*) FROM users WHERE id = ?');

    for (const user of users) {
        const { id, name, username, email, phone, website } = user,
            double = selectUser.get(id)['COUNT(*)'] > 0;
        if (!double) {
            insert.run(id, name, username, email, phone, website);
        } else {
            console.log(`Пользователь ${name} с ID ${id} уже существует`);
        }

    }
}

(async () => {
    const
        users = await getUsers();
    if (users.length > 0) {
        const
            countUsers = database.prepare('SELECT COUNT(*) FROM users').get()['COUNT(*)'];
        if (countUsers === 0) {
            const dataUsers = users.map(
                ({ id, name, username, email, phone, website }) => (
                    { id, name, username, email, phone, website }));
            console.log(dataUsers)
        }
        addUsers(users);
    }
})()
