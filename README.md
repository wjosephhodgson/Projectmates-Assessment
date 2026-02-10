# Product Management App Documentation

In the project folder, install deps ->
npm install
Then run the project ->
npm start

The app will open at `http://localhost:3000`


## 🗒️ Notes and potential enhancements

- There were a couple products with duplicate IDs. removeDuplicateProducts() gets around this and warns in the console
- CSS is react inline, but would be moved to separate stylesheets for a larger app
- Data could be moved to localStorage for performance
- If the products had images I would likely move away from the table format but it was efficient for this dataset
- I apologize for the "not secure" warning in Chrome; had to spin up a new personal site with fresh hosting etc