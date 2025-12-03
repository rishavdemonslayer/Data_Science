package University.Management;

import com.toedter.calendar.JDateChooser;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.sql.ResultSet;

public class UpdateFaculty extends JFrame implements ActionListener {

    JTextField textAddress,textPhone,textemail,textadno,textcourse,textbranch;
    JLabel empText;
    JButton submit,cancel;

    Choice cEMPID;

    UpdateFaculty(){

        getContentPane().setBackground(new Color(230,210,205));

        JLabel heading = new JLabel("Update Teacher Details");
        heading.setBounds(50,10,500,50);
        heading.setFont(new Font("serif",Font.BOLD,35));
        add(heading);

        JLabel empID = new JLabel("Select Employee ID");
        empID.setBounds(50,100,200,20);
        empID.setFont(new Font("serif",Font.PLAIN,20));
        add(empID);

        cEMPID = new Choice();
        cEMPID.setBounds(250,100,200,20);
        add(cEMPID);

        try {
            Conn c = new Conn();
            ResultSet rs = c.statement.executeQuery("select * from teacher");
            while (rs.next()){
                cEMPID.add(rs.getString("empID"));
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        JLabel name = new JLabel("Name");
        name.setBounds(50,150,100,30);
        name.setFont(new Font("serif",Font.BOLD,20));
        add(name);

        JLabel textName = new JLabel();
        textName.setBounds(200,150,150,30);
        add(textName);

        JLabel fname = new JLabel("Father's Name");
        fname.setBounds(400,150,200,30);
        fname.setFont(new Font("serif",Font.BOLD,20));
        add(fname);

        JLabel textfather = new JLabel();
        textfather.setBounds(600,150,150,30);
        add(textfather);

        JLabel empid = new JLabel("Faculty ID");
        empid.setBounds(50,200,200,30);
        empid.setFont(new Font("serif",Font.BOLD,20));
        add(empid);

        empText = new JLabel();
        empText.setBounds(200,200,150,30);
        empText.setFont(new Font("serif",Font.BOLD,20));
        add(empText);

        JLabel dob = new JLabel("Date Of Birth");
        dob.setBounds(600,200,200,30);
        dob.setFont(new Font("serif",Font.BOLD,20));
        add(dob);

        JLabel dobdob = new JLabel();
        dob.setBounds(400,200,150,30);
        add(dobdob);

        JLabel address = new JLabel("Address");
        address.setBounds(50,250,200,30);
        address.setFont(new Font("serif",Font.BOLD,20));
        add(address);

        textAddress = new JTextField();
        textAddress.setBounds(200,250,150,30);
        add(textAddress);

        JLabel phone = new JLabel("Mobile Number");
        phone.setBounds(400,250,200,30);
        phone.setFont(new Font("serif",Font.BOLD,20));
        add(phone);

        textPhone = new JTextField();
        textPhone.setBounds(600,250,150,30);
        add(textPhone);

        JLabel email = new JLabel("E-Mail");
        email.setBounds(50,300,200,30);
        email.setFont(new Font("serif",Font.BOLD,20));
        add(email);

        textemail = new JTextField();
        textemail.setBounds(200,300,150,30);
        add(textemail);

        JLabel m10 = new JLabel("X(%)");
        m10.setBounds(400,300,200,30);
        m10.setFont(new Font("serif",Font.BOLD,20));
        add(m10);

        JLabel text10 = new JLabel();
        text10.setBounds(600,300,150,30);
        add(text10);

        JLabel m12 = new JLabel("XII(%)");
        m12.setBounds(50,350,200,30);
        m12.setFont(new Font("serif",Font.BOLD,20));
        add(m12);

        JLabel text12 = new JLabel();
        text12.setBounds(200,350,150,30);
        add(text12);

        JLabel Aadharno = new JLabel("Aadhar Number");
        Aadharno.setBounds(400,350,200,30);
        Aadharno.setFont(new Font("serif",Font.BOLD,20));
        add(Aadharno);

        textadno = new JTextField();
        textadno.setBounds(600,350,150,30);
        add(textadno);

        JLabel Qualification = new JLabel("Qualification");
        Qualification.setBounds(50,400,150,30);
        Qualification.setFont(new Font("serif",Font.BOLD,20));
        add(Qualification);

        textcourse = new JTextField();
        textcourse.setBounds(200,400,150,30);
        add(textcourse);


        JLabel Department = new JLabel("Department");
        Department.setBounds(400,400,200,30);
        Department.setFont(new Font("serif",Font.BOLD,20));
        add(Department);

        textbranch = new JTextField();
        textbranch.setBounds(600,400,150,30);
        add(textbranch);

        try {
            Conn c = new Conn();
            String query = "select * from teacher where empID = '"+cEMPID.getSelectedItem()+"'";
            ResultSet resultSet = c.statement.executeQuery(query);
            while (resultSet.next()){
                textName.setText(resultSet.getString("name"));
                textfather.setText(resultSet.getString("fname"));
                dobdob.setText(resultSet.getString("dob"));
                textAddress.setText(resultSet.getString("address"));
                textPhone.setText(resultSet.getString("phone"));
                textemail.setText(resultSet.getString("email"));
                text10.setText(resultSet.getString("class_x"));
                text12.setText(resultSet.getString("class_xii"));
                textadno.setText(resultSet.getString("Aadhar"));
                empText.setText(resultSet.getString("empID"));
                textcourse.setText(resultSet.getString("education"));
                textbranch.setText(resultSet.getString("department"));
            }
        }catch (Exception E){
            E.printStackTrace();
        }

        cEMPID.addItemListener(new ItemListener() {
            @Override
            public void itemStateChanged(ItemEvent e) {
                try {
                    Conn c = new Conn();
                    String query = "select * from teacher where empID = '"+cEMPID.getSelectedItem()+"'";
                    ResultSet resultSet = c.statement.executeQuery(query);
                    while (resultSet.next()) {
                        textName.setText(resultSet.getString("name"));
                        textfather.setText(resultSet.getString("fname"));
                        dobdob.setText(resultSet.getString("dob"));
                        textAddress.setText(resultSet.getString("address"));
                        textPhone.setText(resultSet.getString("phone"));
                        textemail.setText(resultSet.getString("email"));
                        text10.setText(resultSet.getString("class_x"));
                        text12.setText(resultSet.getString("class_xii"));
                        textadno.setText(resultSet.getString("Aadhar"));
                        empText.setText(resultSet.getString("empID"));
                        textcourse.setText(resultSet.getString("education"));
                        textbranch.setText(resultSet.getString("department"));
                    }
                }catch (Exception E){
                    E.printStackTrace();
                }
            }
        });

        submit = new JButton("Update");
        submit.setBounds(250,550,120,30);
        submit.setBackground(Color.black);
        submit.setForeground(Color.white);
        submit.addActionListener(this);
        add(submit);

        cancel = new JButton("Cancel");
        cancel.setBounds(450,550,120,30);
        cancel.setBackground(Color.black);
        cancel.setForeground(Color.white);
        cancel.addActionListener(this);
        add(cancel);


        setSize(900,700);
        setLocation(350,50);
        setLayout(null);
        setVisible(true);

    }

    @Override
    public void actionPerformed(ActionEvent e){
        if (e.getSource() == submit){
            String empid = empText.getText();
            String address = textAddress.getText();
            String phoneno = textPhone.getText();
            String email = textemail.getText();
            String course = textcourse.getText();
            String branch = textbranch.getText();

            try {
                String Q = "update teacher set address = '"+address+"', phone = '"+phoneno+"', email= '"+email+"', education = '"+course+"', department = '"+branch+"' where empID = '"+empid+"'";
                Conn c = new Conn();
                c.statement.executeUpdate(Q);
                JOptionPane.showMessageDialog(null,"Updated Successfully");
                setVisible(false);

            }catch (Exception E){
                E.printStackTrace();
            }


        }else {
            setVisible(false);
        }

    }


    public static void main(String[] args){
        new UpdateFaculty();
    }
}
