const nodemailer = require('nodemailer');
const campController = (app, db) => {
  // Create the email transport
 
  const transport = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider here
    auth: {
      user: 'bloodcarenexus@gmail.com', // Your email address
      pass: 'dbqt mogk nvpp brcr', // Your email password or app password
    },
  });
  app.post("/reg-camp", async (req, res) => {
    try {
      const { name, date, address, district, organizer, bank_id, contact, startTime, endTime } = req.body;
  
      // Check if a camp with the same name and date already exists
      const existingCamp = await db.promise().query("SELECT * FROM Camps WHERE name = ? AND date = ?", [name, date]);
      if (existingCamp[0].length > 0) {
        return res.status(400).json({ error: 'A camp with the same name and date already exists' });
      }
  
      const insertCamp = "INSERT INTO Camps (name, date, address, district, bank_id, organizer, contact, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  
      // Use db.promise().query() for the promise-based API
      const [campId] = await db.promise().query(insertCamp, [name, date, address, district, bank_id, organizer, contact, startTime, endTime]);
  
      // Construct the message body containing camp details
      const messageBody = `A new camp has been registered:\n\nName: ${name}\nDate: ${date}\nAddress: ${address}\nDistrict: ${district}\nOrganized by: ${organizer}\nContact: ${contact}\nStart Time: ${startTime}\nEnd Time: ${endTime}\n\nPlease join us for blood donation.`;
  
      // Fetch all user emails from your database
      const [users] = await db.promise().query("SELECT userEmail FROM user_details");
      
      // Send email to all users
      users.forEach(async (user) => {
        // Access the userEmail property directly from the user object
        const userEmail = user.userEmail;
  
        if (userEmail) {
          const message = {
            from: "bloodcarenexus@gmail.com",
            to: userEmail,
            subject: "New Camp Registered",
            text: messageBody
          };
  
  
          transport.sendMail(message, function(err, info) {
            if (err) {
              console.log(err);
            } else {
              console.log(info);
            }
          });
        } else {
          console.log("No email found for user:", user);
        }
      });
  
      const insertedCampDetails = {
        campId: campId.insertId,
        name,
        date,
        address,
        district,
        bank_id,
        organizer,
        contact,
        startTime,
        endTime
      };
  
      res.status(200).json({ message: 'Camp registered successfully', campDetails: insertedCampDetails });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


const { check, validationResult } = require('express-validator');



app.get("/allCamps",  async (req, res) => {
    try {
      const selectAllCamps = "SELECT * FROM Camps";
      const [rows] = await db.promise().query(selectAllCamps);
  
      // Modify each camp's details to include more information if needed
      const campsWithDetails = rows.map(camp => ({
        campId: camp.camp_id,
        name: camp.name,
        date: camp.date,
        address: camp.address,
        district: camp.district,
        bank_id: camp.bank_id,
        organizer: camp.organizer,
        contact: camp.contact,
        startTime: camp.startTime,
        endTime: camp.endTime,
      }));
  
      res.status(200).json(campsWithDetails);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put("/camps/:id", async (req, res) => {
    try {
      const { id } = req.params; // Extracting the camp ID from request parameters
      const { name, date, address, district, organizer, contact, startTime, endTime } = req.body;
  
      const updateCamp = "UPDATE Camps SET name=?, date=?, address=?, district=?, organizer=?, contact=?, starttime=?, endtime=? WHERE camp_id=?";
      
      // Log the SQL query and values for debugging
      console.log('SQL Query:', updateCamp);
      console.log('Values:', [name, date, address, district, organizer, contact, startTime, endTime, id]);
  
      // Use db.promise().query() for the promise-based API
      await db.promise().query(updateCamp, [name, date, address, district, organizer, contact, startTime, endTime, id]);
  
      res.status(200).json({ message: 'Camp updated successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
  });

  

app.delete('/camps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCamp = 'DELETE FROM Camps WHERE camp_id = ?';
    await db.promise().query(deleteCamp, [id]);
    res.status(200).json({ message: 'Camp deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.post("/camp/collect", async (req, res) => {
    try {
        const { camp_id, donorName, bloodGroup,campName, donationDate, donationTime, bloodUnit } = req.body;

        // Ensure that camp_id is provided in the request body
        if (!camp_id) {
            return res.status(400).json({ error: 'camp_id is required in the request body' });
        }

        // Check if the camp exists
        const campExistsQuery = "SELECT * FROM camps WHERE camp_id = ?";
        const [campExists] = await db.promise().query(campExistsQuery, [camp_id]);

        if (campExists.length === 0) {
            return res.status(404).json({ error: 'Camp does not exist' });
        }

        // Validate form data
        if (!donorName || !bloodGroup || !donationDate || !donationTime || !bloodUnit) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insert the donation into the database
        const insertDonation = "INSERT INTO camp_donations (camp_id, donor_name, blood_group,campName, donation_date, donation_time, blood_unit) VALUES (?, ?, ?, ?,?, ?, ?)";
        await db.promise().query(insertDonation, [camp_id, donorName, bloodGroup, campName,donationDate, donationTime, bloodUnit]);

        res.status(200).json({ message: 'Blood donation collected successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


  app.get("/camps/:campId", async (req, res) => {
    try {
      const { campId } = req.params;
  
      const selectCampQuery = "SELECT * FROM Camps WHERE camp_id = ?";
      const [rows] = await db.promise().query(selectCampQuery, [campId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Camp not found' });
      }
  
      const camp = rows[0];
  
      // Modify the camp's details to include more information if needed
      const campWithDetails = {
        campId: camp.camp_id,
        name: camp.name,
        date: camp.date,
        address: camp.address,
        district: camp.district,
        bank_id: camp.bank_id,
        organizer: camp.organizer,
        contact: camp.contact,
        startTime: camp.startTime,
        endTime: camp.endTime,
        
      };
  
      res.status(200).json(campWithDetails);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
}


module.exports = campController;
