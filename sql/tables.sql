drop database if exists TemplatePreview;
create database TemplatePreview;
use TemplatePreview;
create table settings (
  first_user int,
  restricted_users boolean
);

create table user (
  id int not null primary key auto_increment,
  username varchar(200) not null,
  name varchar(200),
  passwordhash varchar(32) not null,
  last_data text default null
);

create table prints (
  id int not null primary key auto_increment,
  filename varchar(500) not null,
  creator int not null,
  shared boolean default false,
  template int not null,
  cat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table template (
  id int not null primary key auto_increment,
  -- name varchar(200) not null,
  tname varchar(200) not null,
  description text default null,
  shared boolean default false,
  content text default null,
  creator int not null,
  cat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
