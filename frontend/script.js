
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");

searchBtn.addEventListener("click", async () => {
    const year = document.getElementById("year").value;
    const section = document.getElementById("section").value;
    const day = document.getElementById("day").value;

    result.innerHTML = "<p>Loading timetable...</p>";

    try {
        const url =
            `http://localhost:5000/api/timetable?year=${encodeURIComponent(year)}&section=${encodeURIComponent(section)}&day=${encodeURIComponent(day)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch timetable");
        }

        const timetable = await response.json();

        result.innerHTML = `<h2>${day} Timetable</h2>`;

        if (timetable.length === 0) {
            result.innerHTML +=
                "<p>No classes found for this selection.</p>";
            return;
        }

        const table = document.createElement("table");
        table.border = "1";
        table.cellPadding = "10";
        table.style.width = "100%";

        table.innerHTML = `
            <tr>
                <th>Time</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Room</th>
            </tr>
        `;

        timetable.forEach(item => {
            const row = table.insertRow();

            [
                item.time,
                item.subject,
                item.faculty,
                item.room
            ].forEach(value => {
                const cell = row.insertCell();
                cell.textContent = value;
            });
        });

        result.appendChild(table);

    } catch (error) {
        result.innerHTML =
            "<p>Unable to load timetable. Please check whether the backend is running.</p>";

        console.error(error);
    }
});
