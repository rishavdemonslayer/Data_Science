package University.Management;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class main_class extends JFrame implements ActionListener {
    main_class(){
        ImageIcon i1= new ImageIcon(ClassLoader.getSystemResource("icon/third.png"));
        Image i2 = i1.getImage().getScaledInstance(1540,800,Image.SCALE_DEFAULT);
        ImageIcon i3 = new ImageIcon(i2);
        JLabel img = new JLabel(i3);
        add(img);

        JMenuBar mb = new JMenuBar();

        //new info

        JMenu newInfo = new JMenu("New Information");
        newInfo.setForeground(Color.black);
        mb.add(newInfo);

        JMenuItem facultyInfo = new JMenuItem("New Faculty Information");
        facultyInfo.setBackground(Color.white);
        facultyInfo.addActionListener(this);
        newInfo.add(facultyInfo);


        JMenuItem studentInfo = new JMenuItem("New Student Information");
        studentInfo.setBackground(Color.white);
        studentInfo.addActionListener(this);
        newInfo.add(studentInfo);

        //Details

        JMenu details = new JMenu("View Details");
        details.setForeground(Color.black);
        mb.add(details);

        JMenuItem facultydetails = new JMenuItem("Faculty Details");
        facultydetails.setBackground(Color.white);
        facultydetails.addActionListener(this);
        details.add(facultydetails);


        JMenuItem studentdetails = new JMenuItem("Student Details");
        studentdetails.setBackground(Color.white);
        studentdetails.addActionListener(this);
        details.add(studentdetails);

        //Leave

        JMenu leave = new JMenu("Apply Leave");
        leave.setForeground(Color.black);
        mb.add(leave);

        JMenuItem facultyleave = new JMenuItem("Faculty Leave");
        facultyleave.setBackground(Color.white);
        facultyleave.addActionListener(this);
        leave.add(facultyleave);


        JMenuItem studentleave = new JMenuItem("Student Leave");
        studentleave.setBackground(Color.white);
        studentleave.addActionListener(this);
        leave.add(studentleave);

        //Leave Details;

        JMenu leavedet = new JMenu("Leave Details");
        leavedet.setForeground(Color.black);
        mb.add(leavedet);

        JMenuItem facultyleavedet = new JMenuItem("Faculty Leave Details");
        facultyleavedet.setBackground(Color.white);
        facultyleavedet.addActionListener(this);
        leavedet.add(facultyleavedet);


        JMenuItem studentleavedet = new JMenuItem("Student Leave Details");
        studentleavedet.setBackground(Color.white);
        studentleavedet.addActionListener(this);
        leavedet.add(studentleavedet);

        //Exams
        JMenu exam = new JMenu("Examination");
        exam.setForeground(Color.black);
        mb.add(exam);

        JMenuItem examdet = new JMenuItem("Examination Results");
        examdet.setBackground(Color.white);
        examdet.addActionListener(this);
        exam.add(examdet);


        JMenuItem Entermarks = new JMenuItem("Enter Marks");
        Entermarks.setBackground(Color.white);
        Entermarks.addActionListener(this);
        exam.add(Entermarks);

        //update info

        JMenu updateinfo = new JMenu("Update Details");
        updateinfo.setForeground(Color.black);
        mb.add(updateinfo);

        JMenuItem upfinfo = new JMenuItem("Update Faculty Details");
        upfinfo.setBackground(Color.white);
        upfinfo.addActionListener(this);
        updateinfo.add(upfinfo);

        JMenuItem upsinfo = new JMenuItem("Update Student Details");
        upsinfo.setBackground(Color.white);
        upsinfo.addActionListener(this);
        updateinfo.add(upsinfo);

        //fees

        JMenu fee = new JMenu("Fee Details");
        fee.setForeground(Color.black);
        mb.add(fee);

        JMenuItem feestructure = new JMenuItem("Fee Structure");
        feestructure.setBackground(Color.white);
        feestructure.addActionListener(this);
        fee.add(feestructure);

        JMenuItem feeform = new JMenuItem("Student Fee Form");
        feeform.setBackground(Color.white);
        feeform.addActionListener(this);
        fee.add(feeform);

        //utility

        JMenu utility = new JMenu("Utilities");
        utility.setForeground(Color.black);
        mb.add(utility);

        JMenuItem calculator = new JMenuItem("Calculator");
        calculator.setBackground(Color.white);
        calculator.addActionListener(this);
        utility.add(calculator);

        JMenuItem notepad = new JMenuItem("Notepad");
        notepad.setBackground(Color.white);
        notepad.addActionListener(this);
        utility.add(notepad);

        //exit

        JMenu exit = new JMenu("Exit");
        exit.setForeground(Color.black);
        mb.add(exit);

        JMenuItem Exit = new JMenuItem("Exit");
        Exit.setBackground(Color.white);
        Exit.addActionListener(this);
        exit.add(Exit);






        setJMenuBar(mb);


        setSize(1540,800);
        setVisible(true);

    }

    @Override
    public void actionPerformed(ActionEvent e){
        String sm = e.getActionCommand();
        if (sm.equals("Exit")){
            System.exit(69);
        } else if (sm.equals("Calculator")) {
            try {
                Runtime.getRuntime().exec("calc.exe");
            }catch (Exception E){
                E.printStackTrace();
            }
        } else if (sm.equals("Notepad")) {
            try {
                Runtime.getRuntime().exec("notepad.exe");
            }catch (Exception E){
                E.printStackTrace();
            }

            
        } else if (sm.equals("New Faculty Information")) {
            new AddFaculty();
        } else if (sm.equals("New Student Information")) {
            new AddStudent();
        } else if (sm.equals("Faculty Details")) {
            new TeacherDetails();
        } else if (sm.equals("Student Details")) {
            new StudentDetails();
        } else if (sm.equals("Faculty Leave")) {
            new FacultyLeave();
        } else if (sm.equals("Student Leave")) {
            new StudentLeave();
        } else if (sm.equals("Faculty Leave Details")) {
            new FacultyLeaveDetail();
        } else if (sm.equals("Student Leave Details")) {
            new StudentLeaveDetails();
        } else if (sm.equals("Examination Results")) {
            new ExaminationDetails();
        } else if (sm.equals("Enter Marks")) {
            new EnterMarks();
        } else if (sm.equals("Update Faculty Details")) {
            new UpdateFaculty();
        } else if (sm.equals("Update Student Details")) {
            new UpdateStudent();
        } else if (sm.equals("Fee Structure")) {
            new FeeStructure();
        } else if (sm.equals("Student Fee Form")) {
            new StudentFeeForm();
        }

    }

    public static void main(String[] args){
        new main_class();

    }
}
