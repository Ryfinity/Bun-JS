const database = require("../config/mysql2");

const getUsers = async (req: any, res: any) => {
    try {
        const [rows] = await database.query("SELECT * FROM users");
        res.status(200).json(rows);
    } catch {
        res.status(500).send("Internal Error")
    }
}

const getUserById = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const [rows] = await database.query("SELECT * FROM users WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).send("Internal Error");
    }
}

const addUser = async (req: any, res: any) => {
    const { name, age, gender } = req.body;
    try {
        const [result] = await database.query("INSERT INTO users (name, age, gender) VALUES (?, ?, ?)", [name, age, gender]);
        res.status(201).json({ id: result.insertId, name, age, gender });
    } catch (error) {
        res.status(500).send("Internal Error");
    }
}

const updateUser = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, age, gender } = req.body;
    try {
        const [result] = await database.query("UPDATE users SET name = ?, age = ?, gender = ? WHERE id = ?", [name, age, gender, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ id, name, age, gender });
    } catch (error) {
        res.status(500).send("Internal Error");
    }
}

const deleteUser = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const [result] = await database.query("DELETE FROM users WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.send('User deleted successfully');
    } catch (error) {
        res.status(500).send("Internal Error");
    }
}

module.exports = { getUsers, getUserById, addUser, updateUser, deleteUser };