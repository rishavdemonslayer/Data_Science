package University.Management;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.sql.ResultSet;

public class StudentFeeForm extends JFrame implements ActionListener {
    Choice CrollNumber;
    JComboBox courseBox,departmentBox,semesterBox;
    JLabel totalAmount;
    JButton pay,update,back;
    StudentFeeForm(){

        getContentPane().setBackground(new Color(210,252,251));
        ImageIcon i1 = new ImageIcon(ClassLoader.getSystemResource("icon/fee.png"));
        Image i2 = i1.getImage().getScaledInstance(500,300,Image.SCALE_DEFAULT);
        ImageIcon i3 = new ImageIcon(i2);
        JLabel img = new JLabel(i3);
        img.setBounds(400,50,500,300);
        add(img);

        JLabel roolNumber = new JLabel("Select USN");
        roolNumber.setBounds(40,60,150,20);
        roolNumber.setFont(new Font("Tahoma",Font.BOLD,16));
        add(roolNumber);

        CrollNumber = new Choice();
        CrollNumber.setBounds(200,60,150,20);
        add(CrollNumber);

        try {
            Conn c = new Conn();
            ResultSet rs = c.statement.executeQuery("select * from student");
            while (rs.next()){
                CrollNumber.add(rs.getString("USN"));
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        JLabel name = new JLabel("Name");
        name.setBounds(40,100,150,20);
        add(name);

        JLabel textName = new JLabel();
        textName.setBounds(200,100,150,20);
        add(textName);

        JLabel fname = new JLabel("Father's Name");
        fname.setBounds(40,140,150,20);
        add(fname);

        JLabel textfName = new JLabel();
        textfName.setBounds(200,140,150,20);
        add(textfName);

        try {
            Conn c = new Conn();
            String Q = "select * from student where USN = '"+CrollNumber.getSelectedItem()+"'";
            ResultSet resultSet = c.statement.executeQuery(Q);
            while (resultSet.next()){
                textName.setName(resultSet.getString("name"));
                textfName.setName(resultSet.getString("fname"));

            }
        }catch (Exception e){
            e.printStackTrace();
        }

        CrollNumber.addItemListener(new ItemListener() {
            @Override
            public void itemStateChanged(ItemEvent e) {
                try {
                    Conn c = new Conn();
                    String Q = "select * from student where USN = '"+CrollNumber.getSelectedItem()+"'";
                    ResultSet resultSet = c.statement.executeQuery(Q);
                    while (resultSet.next()){
                        textName.setName(resultSet.getString("name"));
                        textfName.setName(resultSet.getString("fname"));

                    }
                }catch (Exception E){
                    E.printStackTrace();
                }
            }
        });

        JLabel Qualification = new JLabel("Entrance Mode");
        Qualification.setBounds(40,180,150,20);
        //Qualification.setFont(new Font("Tahoma",Font.BOLD,16));
        add(Qualification);

        String course[] = {"RSAT","JEE","CET","COMED-K","Management"};
        courseBox = new JComboBox(course);
        courseBox.setBounds(200,180,150,20);
        courseBox.setBackground(Color.white);
        add(courseBox);

        JLabel Department = new JLabel("Branch");
        Department.setBounds(40,220,150,20);
        //Department.setFont(new Font("Tahoma",Font.BOLD,16));
        add(Department);

        String department[] = {"CSE","EC","EEE","AIML","ME","CE","MnC"};
        departmentBox = new JComboBox(department);
        departmentBox.setBounds(200,220,150,20);
        departmentBox.setBackground(Color.white);
        add(departmentBox);

        JLabel textsemester = new JLabel("Semester");
        textsemester.setBounds(40,260,150,20);
        add(textsemester);

        String semester[] = {"I","II","III","IV","V","VI","VII","VIII"};
        semesterBox = new JComboBox(semester);
        semesterBox.setBounds(200,260,150,20);
        semesterBox.setBackground(Color.white);
        add(semesterBox);

        JLabel total = new JLabel("Total Payable");
        total.setBounds(40,300,150,20);
        add(total);

        totalAmount = new JLabel();
        totalAmount.setBounds(200,200,150,220);
        add(totalAmount);

        update = new JButton("Update");
        update.setBounds(30,380,100,25);
        update.addActionListener(this);
        add(update);

        pay = new JButton("Pay");
        pay.setBounds(150,380,100,25);
        pay.addActionListener(this);
        add(pay);

        back = new JButton("Back");
        back.setBounds(270,380,100,25);
        back.addActionListener(this);
        add(back);








        setSize(900,500);
        setLocation(300,100);
        setLayout(null);
        setVisible(true);

    }

    @Override
    public void actionPerformed(ActionEvent e){
        if (e.getSource()==update){
            String course = (String) departmentBox.getSelectedItem();
            String semester = (String) semesterBox.getSelectedItem();
            try {
                Conn c = new Conn();
                ResultSet resultSet = c.statement.executeQuery("select * from fee where branch = '"+course+"'");
                while (resultSet.next()){
                    totalAmount.setText(resultSet.getString("semester1"));
                }
            }catch (Exception E){
                E.printStackTrace();
            }
        } else if (e.getSource()==pay) {
            String rollno = CrollNumber.getSelectedItem();
            String branch = (String) departmentBox.getSelectedItem();
            String semester = (String) semesterBox.getSelectedItem();
            String total = totalAmount.getText();

            try {
                Conn c = new Conn();
                String Q = "insert into feecollege values('"+rollno+"','"+branch+"','"+semester+"','"+total+"')";
                c.statement.executeUpdate(Q);
                JOptionPane.showMessageDialog(null,"Submission Successful");

            }catch (Exception E){
                E.printStackTrace();
            }

        }else {
            setVisible(false);
        }
    }


    public static void main(String[] args){
        new StudentFeeForm();
    }
}
