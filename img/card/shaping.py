import os
from PIL import Image

output_file_name = [
    'masanari_ichikawa_qr.jpg',
    'masanari_ichikawa_jp.jpg',
    'masanari_ichikawa_en.jpg'
]

# 絶対パスの取得
base_dir = '/Users/ichikawamasanari/GitHub/masanarius.github.io/img/card'
original_dir = os.path.join(base_dir, 'businesscard_original')
output_dir = os.path.join(base_dir, 'businesscard')

for i in range(1, 4):
    org_file_name = 'スライド' + str(i) + '.jpeg'
    org_file_path = os.path.join(original_dir, org_file_name)
    
    if os.path.exists(org_file_path):
        print(org_file_name + ' is found')
        im = Image.open(org_file_path)
        im_rotate = im.rotate(-90, expand=True)
        output_path = os.path.join(output_dir, output_file_name[i - 1])
        im_rotate.save(output_path)
        print(org_file_name + ' is saved as ' + output_file_name[i - 1])
    else:
        print(org_file_name + ' is not found')

sample_file_path = os.path.join(original_dir, 'スライド2.jpeg')
if os.path.exists(sample_file_path):
    im = Image.open(sample_file_path)
    output_sample_path = os.path.join(output_dir, 'sample.jpg')
    im.save(output_sample_path)
    print('sample.jpg saved')
else:
    print('スライド2.jpeg is not found')
